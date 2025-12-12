/**
 * Bill Service
 * Handles bill management, voucher application, split/merge, and calculations
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.10, 21.1, 21.2, 21.3, 21.4, 21.5
 */

const {
  Bill,
  Order,
  Table,
  TableSession,
  Promotion,
  PromotionUsage,
  Payment
} = require('../models');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError
} = require('../utils/errors');
const { BILL_STATUS, TABLE_STATUS, ORDER_STATUS } = require('../utils/constants');

/**
 * Default tax rates (can be overridden by settings)
 */
const DEFAULT_TAX_RATES = {
  SERVICE_CHARGE_PERCENT: 5,
  VAT_PERCENT: 10
};

/**
 * Get bill by ID
 * @param {string} billId - Bill ID
 * @returns {Promise<Object>} Bill details with orders
 */
const getBillById = async (billId) => {
  const bill = await Bill.findById(billId)
    .populate('table', 'tableNumber area')
    .populate('promotion', 'code name discountType discountValue')
    .populate('cashier', 'name employeeCode')
    .lean();

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  // Get orders for this bill
  const orders = await Order.find({ bill: billId })
    .populate('user', 'name')
    .sort({ createdAt: 1 })
    .lean();

  return formatBill(bill, orders);
};

/**
 * Get current bill for a table
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Current open bill
 */
const getBillByTable = async (tableId) => {
  const bill = await Bill.findOne({
    table: tableId,
    status: { $in: [BILL_STATUS.OPEN, BILL_STATUS.REQUESTING_PAYMENT] }
  })
    .populate('table', 'tableNumber area')
    .populate('promotion', 'code name discountType discountValue maxDiscount')
    .lean();

  if (!bill) {
    throw new NotFoundError('No active bill found for this table');
  }

  const orders = await Order.find({ bill: bill._id })
    .populate('user', 'name')
    .sort({ createdAt: 1 })
    .lean();

  return formatBill(bill, orders);
};

/**
 * Get bill for user's active session
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Current bill
 */
const getBillBySession = async (userId) => {
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (!session || !session.bill) {
    throw new NotFoundError('No active bill found for your session');
  }

  return getBillById(session.bill.toString());
};

/**
 * Calculate bill totals
 * @param {Object} bill - Bill document
 * @returns {Object} Calculated totals
 */
const calculateBillTotal = (bill) => {
  const subtotal = bill.subtotal || 0;
  const serviceChargePercent = bill.serviceChargePercent || DEFAULT_TAX_RATES.SERVICE_CHARGE_PERCENT;
  const vatPercent = bill.vatPercent || DEFAULT_TAX_RATES.VAT_PERCENT;
  const discountAmount = bill.discountAmount || 0;

  const serviceChargeAmount = Math.round(subtotal * (serviceChargePercent / 100));
  const taxableAmount = subtotal + serviceChargeAmount;
  const vatAmount = Math.round(taxableAmount * (vatPercent / 100));
  const totalAmount = subtotal + serviceChargeAmount + vatAmount - discountAmount;

  return {
    subtotal,
    serviceChargePercent,
    serviceChargeAmount,
    vatPercent,
    vatAmount,
    discountAmount,
    totalAmount: Math.max(0, totalAmount)
  };
};

/**
 * Recalculate and update bill totals
 * @param {string} billId - Bill ID
 * @returns {Promise<Object>} Updated bill
 */
const recalculateBill = async (billId) => {
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  // Calculate subtotal from orders
  const orders = await Order.find({
    bill: billId,
    status: { $ne: ORDER_STATUS.CANCELLED }
  });

  const subtotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  bill.subtotal = subtotal;

  // Recalculate with current discount
  const totals = calculateBillTotal(bill);

  bill.serviceChargeAmount = totals.serviceChargeAmount;
  bill.vatAmount = totals.vatAmount;
  bill.totalAmount = totals.totalAmount;

  await bill.save();

  return getBillById(billId);
};

/**
 * Apply voucher to bill
 * @param {string} billId - Bill ID
 * @param {string} voucherCode - Voucher code
 * @param {string} userId - User applying the voucher
 * @returns {Promise<Object>} Updated bill
 */
const applyVoucher = async (billId, voucherCode, userId) => {
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  if (bill.status !== BILL_STATUS.OPEN) {
    throw new ForbiddenError('Cannot apply voucher to a closed bill');
  }

  if (bill.promotion) {
    throw new ConflictError('A voucher is already applied to this bill. Remove it first.');
  }

  // Find and validate promotion
  const promotion = await Promotion.findOne({
    code: voucherCode.toUpperCase(),
    isActive: true
  });

  if (!promotion) {
    throw new ValidationError('Invalid voucher code', [
      { field: 'voucherCode', message: 'Voucher code not found or inactive' }
    ]);
  }

  // Check date range
  const now = new Date();
  if (now < promotion.startDate) {
    throw new ValidationError('Voucher is not yet active', [
      { field: 'voucherCode', message: `This voucher is valid from ${promotion.startDate.toLocaleDateString()}` }
    ]);
  }

  if (now > promotion.endDate) {
    throw new ValidationError('Voucher has expired', [
      { field: 'voucherCode', message: `This voucher expired on ${promotion.endDate.toLocaleDateString()}` }
    ]);
  }

  // Check usage limit
  if (promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit) {
    throw new ValidationError('Voucher usage limit reached', [
      { field: 'voucherCode', message: 'This voucher has reached its maximum usage limit' }
    ]);
  }

  // Check per-user usage limit
  if (promotion.usagePerUser !== null) {
    const userUsageCount = await PromotionUsage.countDocuments({
      promotion: promotion._id,
      user: userId
    });

    if (userUsageCount >= promotion.usagePerUser) {
      throw new ValidationError('You have already used this voucher', [
        { field: 'voucherCode', message: `This voucher can only be used ${promotion.usagePerUser} time(s) per user` }
      ]);
    }
  }

  // Check minimum order amount
  if (bill.subtotal < promotion.minOrderAmount) {
    throw new ValidationError('Minimum order amount not met', [
      {
        field: 'voucherCode',
        message: `Minimum order amount is ${promotion.minOrderAmount.toLocaleString()} VND. Your current subtotal is ${bill.subtotal.toLocaleString()} VND`
      }
    ]);
  }

  // Calculate discount
  let discountAmount;
  if (promotion.discountType === 'percent') {
    discountAmount = Math.round(bill.subtotal * (promotion.discountValue / 100));
  } else {
    discountAmount = promotion.discountValue;
  }

  // Apply max discount cap (Property 9: Voucher Discount Cap)
  if (promotion.maxDiscount !== null && discountAmount > promotion.maxDiscount) {
    discountAmount = promotion.maxDiscount;
  }

  // Cannot discount more than subtotal
  discountAmount = Math.min(discountAmount, bill.subtotal);

  // Apply voucher to bill
  bill.promotion = promotion._id;
  bill.discountAmount = discountAmount;

  // Recalculate totals
  const totals = calculateBillTotal(bill);
  bill.serviceChargeAmount = totals.serviceChargeAmount;
  bill.vatAmount = totals.vatAmount;
  bill.totalAmount = totals.totalAmount;

  await bill.save();

  // Record voucher usage (Property 10: Voucher Usage Recording)
  await PromotionUsage.create({
    promotion: promotion._id,
    user: userId,
    bill: bill._id,
    discountAmount,
    usedAt: new Date()
  });

  // Increment promotion usage count
  await Promotion.findByIdAndUpdate(promotion._id, {
    $inc: { usedCount: 1 }
  });

  // Check if promotion should be deactivated
  if (promotion.usageLimit !== null && promotion.usedCount + 1 >= promotion.usageLimit) {
    await Promotion.findByIdAndUpdate(promotion._id, { isActive: false });
  }

  return getBillById(billId);
};

/**
 * Remove voucher from bill
 * @param {string} billId - Bill ID
 * @param {string} userId - User removing the voucher
 * @returns {Promise<Object>} Updated bill
 */
const removeVoucher = async (billId, userId) => {
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  if (bill.status !== BILL_STATUS.OPEN) {
    throw new ForbiddenError('Cannot remove voucher from a closed bill');
  }

  if (!bill.promotion) {
    throw new ValidationError('No voucher applied to this bill');
  }

  const promotionId = bill.promotion;

  // Remove voucher from bill
  bill.promotion = null;
  bill.discountAmount = 0;

  // Recalculate totals
  const totals = calculateBillTotal(bill);
  bill.serviceChargeAmount = totals.serviceChargeAmount;
  bill.vatAmount = totals.vatAmount;
  bill.totalAmount = totals.totalAmount;

  await bill.save();

  // Remove usage record
  await PromotionUsage.deleteOne({
    promotion: promotionId,
    bill: billId
  });

  // Decrement promotion usage count
  await Promotion.findByIdAndUpdate(promotionId, {
    $inc: { usedCount: -1 }
  });

  return getBillById(billId);
};

/**
 * Split bill - create new bill with selected items
 * @param {string} billId - Original bill ID
 * @param {Array} items - Items to move to new bill [{orderItemId, quantity}]
 * @param {Object} staff - Staff performing the split
 * @returns {Promise<Object>} Both bills
 */
const splitBill = async (billId, items, staff) => {
  const originalBill = await Bill.findById(billId);

  if (!originalBill) {
    throw new NotFoundError('Bill not found');
  }

  if (originalBill.status !== BILL_STATUS.OPEN) {
    throw new ForbiddenError('Cannot split a closed bill');
  }

  // Get orders for the bill
  const orders = await Order.find({
    bill: billId,
    status: { $ne: ORDER_STATUS.CANCELLED }
  });

  // Validate items to split
  const itemsToMove = [];
  let moveAmount = 0;

  for (const splitItem of items) {
    let found = false;

    for (const order of orders) {
      const orderItem = order.items.find(
        i => i._id.toString() === splitItem.orderItemId
      );

      if (orderItem) {
        if (splitItem.quantity > orderItem.quantity) {
          throw new ValidationError(`Cannot split ${splitItem.quantity} items. Only ${orderItem.quantity} available.`);
        }

        itemsToMove.push({
          order,
          orderItem,
          quantity: splitItem.quantity
        });

        moveAmount += (orderItem.unitPrice * splitItem.quantity);
        found = true;
        break;
      }
    }

    if (!found) {
      throw new NotFoundError(`Order item ${splitItem.orderItemId} not found`);
    }
  }

  // Create new bill
  const newBillNumber = `${originalBill.billNumber}-S${Date.now().toString(36).toUpperCase()}`;

  const newBill = await Bill.create({
    table: originalBill.table,
    billNumber: newBillNumber,
    guestCount: 1,
    subtotal: moveAmount,
    serviceChargePercent: originalBill.serviceChargePercent,
    vatPercent: originalBill.vatPercent,
    status: BILL_STATUS.OPEN,
    openedAt: new Date()
  });

  // Calculate new bill totals
  const newTotals = calculateBillTotal(newBill);
  newBill.serviceChargeAmount = newTotals.serviceChargeAmount;
  newBill.vatAmount = newTotals.vatAmount;
  newBill.totalAmount = newTotals.totalAmount;
  await newBill.save();

  // Create new order for the split items
  const newOrderItems = itemsToMove.map(({ orderItem, quantity }) => ({
    menuItem: orderItem.menuItem,
    combo: orderItem.combo,
    itemName: orderItem.itemName,
    quantity,
    unitPrice: orderItem.unitPrice,
    subtotal: orderItem.unitPrice * quantity,
    note: orderItem.note,
    status: orderItem.status,
    toppings: orderItem.toppings
  }));

  const newOrder = await Order.create({
    bill: newBill._id,
    user: orders[0].user, // Use first order's user
    orderNumber: `${orders[0].orderNumber}-SPLIT`,
    status: ORDER_STATUS.CONFIRMED,
    totalAmount: moveAmount,
    items: newOrderItems
  });

  // Update original bill subtotal
  originalBill.subtotal -= moveAmount;
  const originalTotals = calculateBillTotal(originalBill);
  originalBill.serviceChargeAmount = originalTotals.serviceChargeAmount;
  originalBill.vatAmount = originalTotals.vatAmount;
  originalBill.totalAmount = originalTotals.totalAmount;
  await originalBill.save();

  // Update original order items (reduce quantity or remove)
  for (const { order, orderItem, quantity } of itemsToMove) {
    const itemIndex = order.items.findIndex(i => i._id.toString() === orderItem._id.toString());

    if (order.items[itemIndex].quantity === quantity) {
      // Remove item completely
      order.items.splice(itemIndex, 1);
    } else {
      // Reduce quantity
      order.items[itemIndex].quantity -= quantity;
      order.items[itemIndex].subtotal = order.items[itemIndex].unitPrice * order.items[itemIndex].quantity;
    }

    order.totalAmount = order.items.reduce((sum, i) => sum + i.subtotal, 0);
    await order.save();
  }

  return {
    originalBill: await getBillById(billId),
    newBill: await getBillById(newBill._id.toString())
  };
};

/**
 * Merge multiple bills into one
 * @param {Array<string>} billIds - Bill IDs to merge
 * @param {string} targetBillId - Target bill ID (or first one if not specified)
 * @param {Object} staff - Staff performing the merge
 * @returns {Promise<Object>} Merged bill
 */
const mergeBills = async (billIds, targetBillId, staff) => {
  if (!billIds || billIds.length < 2) {
    throw new ValidationError('At least 2 bills are required to merge');
  }

  const bills = await Bill.find({
    _id: { $in: billIds },
    status: BILL_STATUS.OPEN
  });

  if (bills.length !== billIds.length) {
    throw new ValidationError('All bills must exist and be open');
  }

  // Check all bills are from the same table
  const tables = [...new Set(bills.map(b => b.table.toString()))];
  if (tables.length > 1) {
    throw new ValidationError('All bills must be from the same table');
  }

  // Determine target bill
  const targetId = targetBillId || billIds[0];
  const targetBill = bills.find(b => b._id.toString() === targetId);

  if (!targetBill) {
    throw new NotFoundError('Target bill not found');
  }

  const sourceBills = bills.filter(b => b._id.toString() !== targetId);

  // Move all orders to target bill
  for (const sourceBill of sourceBills) {
    await Order.updateMany(
      { bill: sourceBill._id },
      { $set: { bill: targetBill._id } }
    );

    // Add subtotal
    targetBill.subtotal += sourceBill.subtotal;
    targetBill.guestCount += sourceBill.guestCount;

    // Cancel source bill
    sourceBill.status = BILL_STATUS.CANCELLED;
    sourceBill.cancelReason = `Merged into bill ${targetBill.billNumber}`;
    await sourceBill.save();
  }

  // If target had a voucher, check if it still meets minimum
  if (targetBill.promotion) {
    const promotion = await Promotion.findById(targetBill.promotion);
    if (promotion && targetBill.subtotal < promotion.minOrderAmount) {
      // Keep voucher since merged subtotal is higher, recalculate discount
      let discountAmount;
      if (promotion.discountType === 'percent') {
        discountAmount = Math.round(targetBill.subtotal * (promotion.discountValue / 100));
      } else {
        discountAmount = promotion.discountValue;
      }

      if (promotion.maxDiscount !== null && discountAmount > promotion.maxDiscount) {
        discountAmount = promotion.maxDiscount;
      }

      targetBill.discountAmount = Math.min(discountAmount, targetBill.subtotal);
    }
  }

  // Recalculate totals
  const totals = calculateBillTotal(targetBill);
  targetBill.serviceChargeAmount = totals.serviceChargeAmount;
  targetBill.vatAmount = totals.vatAmount;
  targetBill.totalAmount = totals.totalAmount;

  await targetBill.save();

  return getBillById(targetId);
};

/**
 * Request payment for bill
 * @param {string} billId - Bill ID
 * @returns {Promise<Object>} Updated bill
 */
const requestPayment = async (billId) => {
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  if (bill.status !== BILL_STATUS.OPEN) {
    throw new ForbiddenError('Bill is not open');
  }

  bill.status = BILL_STATUS.REQUESTING_PAYMENT;
  bill.paymentRequestedAt = new Date();

  await bill.save();

  // TODO: Emit socket event to notify staff
  // socketService.emitToRoom(SOCKET_ROOMS.STAFF, 'bill:payment_requested', { billId, tableId: bill.table });

  return getBillById(billId);
};

/**
 * Close bill after payment
 * @param {string} billId - Bill ID
 * @param {Object} staff - Staff closing the bill
 * @returns {Promise<Object>} Closed bill
 */
const closeBill = async (billId, staff) => {
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  if (bill.status === BILL_STATUS.PAID) {
    throw new ConflictError('Bill is already paid');
  }

  if (bill.status === BILL_STATUS.CANCELLED) {
    throw new ConflictError('Bill is cancelled');
  }

  // Verify payment exists
  const payment = await Payment.findOne({
    bill: billId,
    status: 'completed'
  });

  if (!payment) {
    throw new ValidationError('No completed payment found for this bill');
  }

  // Update bill
  bill.status = BILL_STATUS.PAID;
  bill.cashier = staff?._id;
  bill.closedAt = new Date();

  await bill.save();

  // End all active sessions for this table
  await TableSession.updateMany(
    { bill: billId, isActive: true },
    {
      isActive: false,
      leftAt: new Date()
    }
  );

  // Update table status to available (or cleaning)
  await Table.findByIdAndUpdate(bill.table, {
    status: TABLE_STATUS.CLEANING
  });

  return getBillById(billId);
};

/**
 * Cancel bill
 * @param {string} billId - Bill ID
 * @param {string} reason - Cancellation reason
 * @param {Object} staff - Staff cancelling
 * @returns {Promise<Object>} Cancelled bill
 */
const cancelBill = async (billId, reason, staff) => {
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  if (bill.status === BILL_STATUS.PAID) {
    throw new ConflictError('Cannot cancel a paid bill');
  }

  // Cancel all orders
  await Order.updateMany(
    { bill: billId },
    {
      status: ORDER_STATUS.CANCELLED,
      cancelReason: reason,
      cancelledBy: staff?._id,
      cancelledAt: new Date()
    }
  );

  // If voucher was applied, remove usage
  if (bill.promotion) {
    await PromotionUsage.deleteOne({
      promotion: bill.promotion,
      bill: billId
    });

    await Promotion.findByIdAndUpdate(bill.promotion, {
      $inc: { usedCount: -1 }
    });
  }

  // Cancel bill
  bill.status = BILL_STATUS.CANCELLED;
  bill.cancelReason = reason;
  bill.closedAt = new Date();

  await bill.save();

  // End sessions and free table
  await TableSession.updateMany(
    { bill: billId, isActive: true },
    { isActive: false, leftAt: new Date() }
  );

  await Table.findByIdAndUpdate(bill.table, {
    status: TABLE_STATUS.AVAILABLE
  });

  return getBillById(billId);
};

/**
 * Get bill history for user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated bill history
 */
const getBillHistory = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;

  // Find bills through table sessions
  const sessions = await TableSession.find({ user: userId })
    .select('bill')
    .lean();

  const billIds = [...new Set(sessions.map(s => s.bill).filter(Boolean))];

  const skip = (page - 1) * limit;

  const [bills, total] = await Promise.all([
    Bill.find({
      _id: { $in: billIds },
      status: BILL_STATUS.PAID
    })
      .populate('table', 'tableNumber')
      .sort({ closedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Bill.countDocuments({
      _id: { $in: billIds },
      status: BILL_STATUS.PAID
    })
  ]);

  return {
    bills: bills.map(bill => formatBill(bill)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Update service charge and VAT rates
 * @param {string} billId - Bill ID
 * @param {Object} rates - New rates
 * @returns {Promise<Object>} Updated bill
 */
const updateBillRates = async (billId, rates) => {
  const { serviceChargePercent, vatPercent } = rates;

  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  if (bill.status !== BILL_STATUS.OPEN) {
    throw new ForbiddenError('Cannot update rates on a closed bill');
  }

  if (serviceChargePercent !== undefined) {
    bill.serviceChargePercent = serviceChargePercent;
  }

  if (vatPercent !== undefined) {
    bill.vatPercent = vatPercent;
  }

  // Recalculate totals
  const totals = calculateBillTotal(bill);
  bill.serviceChargeAmount = totals.serviceChargeAmount;
  bill.vatAmount = totals.vatAmount;
  bill.totalAmount = totals.totalAmount;

  await bill.save();

  return getBillById(billId);
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format bill for API response
 */
const formatBill = (bill, orders = []) => {
  return {
    id: bill._id,
    billNumber: bill.billNumber,
    table: bill.table ? {
      id: bill.table._id || bill.table,
      tableNumber: bill.table.tableNumber || null
    } : null,
    guestCount: bill.guestCount,
    subtotal: bill.subtotal,
    serviceChargePercent: bill.serviceChargePercent,
    serviceChargeAmount: bill.serviceChargeAmount,
    vatPercent: bill.vatPercent,
    vatAmount: bill.vatAmount,
    discountAmount: bill.discountAmount,
    totalAmount: bill.totalAmount,
    status: bill.status,
    promotion: bill.promotion ? {
      id: bill.promotion._id || bill.promotion,
      code: bill.promotion.code || null,
      name: bill.promotion.name || null,
      discountType: bill.promotion.discountType || null,
      discountValue: bill.promotion.discountValue || null
    } : null,
    cashier: bill.cashier ? {
      id: bill.cashier._id || bill.cashier,
      name: bill.cashier.name || null
    } : null,
    cancelReason: bill.cancelReason || null,
    openedAt: bill.openedAt,
    paymentRequestedAt: bill.paymentRequestedAt || null,
    closedAt: bill.closedAt || null,
    orders: orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      user: order.user ? { id: order.user._id, name: order.user.name } : null,
      itemCount: order.items?.length || 0,
      createdAt: order.createdAt
    })),
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt
  };
};

module.exports = {
  getBillById,
  getBillByTable,
  getBillBySession,
  calculateBillTotal,
  recalculateBill,
  applyVoucher,
  removeVoucher,
  splitBill,
  mergeBills,
  requestPayment,
  closeBill,
  cancelBill,
  getBillHistory,
  updateBillRates,
  formatBill,
  DEFAULT_TAX_RATES
};
