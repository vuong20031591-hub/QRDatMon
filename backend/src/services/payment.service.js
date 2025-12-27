/**
 * Payment Service
 * Handles VietQR generation, SePay integration, and payment processing
 * Requirements: 6.7, 6.8, 6.9, 22.2
 */

const https = require('https');
const http = require('http');
const { Payment, Bill, Table, TableSession, PromotionUsage, Promotion } = require('../models');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError
} = require('../utils/errors');
const { BILL_STATUS, TABLE_STATUS, PAYMENT_STATUS } = require('../utils/constants');

/**
 * Payment configuration from environment
 */
const config = {
  sepay: {
    baseUrl: process.env.SEPAY_BASE_URL || 'https://my.sepay.vn/userapi',
    apiKey: process.env.SEPAY_API_KEY,
    apiToken: process.env.SEPAY_API_TOKEN
  },
  vietqr: {
    clientId: process.env.VIETQR_CLIENT_ID,
    apiKey: process.env.VIETQR_API_KEY
  },
  bank: {
    accountNumber: process.env.BANK_ACCOUNT_NUMBER,
    accountName: process.env.BANK_ACCOUNT_NAME,
    bankName: process.env.BANK_NAME,
    bankBin: process.env.BANK_BIN || '970422' // MB Bank
  },
  qrExpiryMinutes: parseInt(process.env.QR_EXPIRY_MINUTES, 10) || 15,
  amountTolerance: parseInt(process.env.PAYMENT_AMOUNT_TOLERANCE, 10) || 1000,
  webhookIpWhitelist: (process.env.WEBHOOK_IP_WHITELIST || '127.0.0.1').split(',')
};

/**
 * Generate VietQR payment code
 * @param {string} billId - Bill ID
 * @param {string} userId - User ID requesting payment
 * @returns {Promise<Object>} QR code info
 */
const generateVietQR = async (billId, userId) => {
  const bill = await Bill.findById(billId).populate('table', 'tableNumber');

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  if (bill.status === BILL_STATUS.PAID) {
    throw new ConflictError('Bill is already paid');
  }

  if (bill.status === BILL_STATUS.CANCELLED) {
    throw new ForbiddenError('Cannot pay a cancelled bill');
  }

  // Check for existing pending payment
  const existingPayment = await Payment.findOne({
    bill: billId,
    method: 'qr_banking',
    status: PAYMENT_STATUS.PENDING
  });

  if (existingPayment) {
    // Check if QR is still valid
    const createdAt = new Date(existingPayment.createdAt);
    const expiresAt = new Date(createdAt.getTime() + config.qrExpiryMinutes * 60 * 1000);

    if (new Date() < expiresAt) {
      return formatPaymentResponse(existingPayment, bill, expiresAt);
    }

    // Expire old payment
    existingPayment.status = PAYMENT_STATUS.FAILED;
    existingPayment.note = 'QR code expired';
    await existingPayment.save();
  }

  // Generate unique transaction reference
  const transactionId = generateTransactionId(bill);
  const amount = bill.totalAmount;

  // Generate VietQR URL
  const qrContent = buildVietQRContent({
    bankBin: config.bank.bankBin,
    accountNumber: config.bank.accountNumber,
    amount,
    description: transactionId
  });

  // Use VietQR.io API or build URL directly
  const qrCodeUrl = buildVietQRUrl({
    bankBin: config.bank.bankBin,
    accountNumber: config.bank.accountNumber,
    accountName: config.bank.accountName,
    amount,
    description: transactionId
  });

  // Create payment record
  const payment = await Payment.create({
    bill: billId,
    amount,
    method: 'qr_banking',
    status: PAYMENT_STATUS.PENDING,
    transactionId,
    qrCodeUrl,
    bankCode: config.bank.bankBin,
    bankName: config.bank.bankName,
    paymentDetails: {
      accountNumber: config.bank.accountNumber,
      accountName: config.bank.accountName,
      qrContent
    }
  });

  // Update bill status
  bill.status = BILL_STATUS.REQUESTING_PAYMENT;
  bill.paymentRequestedAt = new Date();
  await bill.save();

  const expiresAt = new Date(payment.createdAt.getTime() + config.qrExpiryMinutes * 60 * 1000);

  return formatPaymentResponse(payment, bill, expiresAt);
};

/**
 * Confirm payment (staff action for cash or manual confirmation)
 * @param {Object} data - Payment confirmation data
 * @param {Object} staff - Staff processing the payment
 * @returns {Promise<Object>} Confirmed payment
 */
const confirmPayment = async (data, staff) => {
  const { billId, method, amount, transactionId, note } = data;

  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new NotFoundError('Bill not found');
  }

  if (bill.status === BILL_STATUS.PAID) {
    throw new ConflictError('Bill is already paid');
  }

  if (bill.status === BILL_STATUS.CANCELLED) {
    throw new ForbiddenError('Cannot pay a cancelled bill');
  }

  // Validate amount
  const expectedAmount = bill.totalAmount;
  const tolerance = config.amountTolerance;

  if (Math.abs(amount - expectedAmount) > tolerance) {
    throw new ValidationError(`Payment amount mismatch. Expected: ${expectedAmount}, Received: ${amount}`);
  }

  // Check for existing pending QR payment
  let payment = await Payment.findOne({
    bill: billId,
    status: PAYMENT_STATUS.PENDING
  });

  if (payment) {
    // Update existing payment
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.processedBy = staff?._id;
    payment.paidAt = new Date();
    payment.note = note;
    if (transactionId) payment.transactionId = transactionId;
    await payment.save();
  } else {
    // Create new payment record
    payment = await Payment.create({
      bill: billId,
      processedBy: staff?._id,
      amount,
      method: method || 'cash',
      status: PAYMENT_STATUS.COMPLETED,
      transactionId: transactionId || generateTransactionId(bill),
      note,
      paidAt: new Date()
    });
  }

  // Update bill status
  bill.status = BILL_STATUS.PAID;
  bill.cashier = staff?._id;
  bill.closedAt = new Date();
  await bill.save();

  // End all active sessions
  await TableSession.updateMany(
    { bill: billId, isActive: true },
    { isActive: false, leftAt: new Date() }
  );

  // Update table status to cleaning
  const table = await Table.findByIdAndUpdate(
    bill.table,
    { status: TABLE_STATUS.CLEANING },
    { new: true }
  );

  // Emit table status change event
  if (table) {
    const { emitTableStatusChanged } = require('../socket/emitters');
    emitTableStatusChanged(table);
  }

  return getPaymentById(payment._id.toString());
};

/**
 * Handle SePay webhook for automatic payment confirmation
 * @param {Object} webhookData - Webhook payload from SePay
 * @param {string} clientIp - Client IP address
 * @returns {Promise<Object>} Processing result
 */
const handleSepayWebhook = async (webhookData, clientIp) => {
  // Validate webhook IP (optional security)
  if (config.webhookIpWhitelist.length > 0) {
    const normalizedIp = normalizeIp(clientIp);
    const isWhitelisted = config.webhookIpWhitelist.some(ip =>
      normalizeIp(ip) === normalizedIp
    );

    if (!isWhitelisted && process.env.NODE_ENV === 'production') {
      console.warn(`Webhook from non-whitelisted IP: ${clientIp}`);
      // In production, you might want to reject non-whitelisted IPs
    }
  }

  const {
    id,
    gateway,
    transactionDate,
    accountNumber,
    transferType,
    transferAmount,
    accumulated,
    code,
    content,
    referenceCode,
    description
  } = webhookData;

  // Log webhook for debugging
  if (process.env.ENABLE_PAYMENT_LOGGING === 'true') {
    console.log('[SePay Webhook]', JSON.stringify(webhookData, null, 2));
  }

  // Only process incoming transfers
  if (transferType !== 'in') {
    return { success: true, message: 'Ignored outgoing transfer' };
  }

  // Extract transaction ID from content/description
  const transactionId = extractTransactionId(content || description || referenceCode);

  if (!transactionId) {
    console.warn('Could not extract transaction ID from webhook:', webhookData);
    return { success: false, message: 'Transaction ID not found in payment content' };
  }

  // Find pending payment with this transaction ID
  const payment = await Payment.findOne({
    transactionId,
    status: PAYMENT_STATUS.PENDING
  });

  if (!payment) {
    console.warn(`No pending payment found for transaction: ${transactionId}`);
    return { success: false, message: 'No matching pending payment found' };
  }

  // Verify amount
  const receivedAmount = parseInt(transferAmount, 10);
  const expectedAmount = payment.amount;
  const tolerance = config.amountTolerance;

  if (Math.abs(receivedAmount - expectedAmount) > tolerance) {
    console.warn(`Amount mismatch for ${transactionId}: expected ${expectedAmount}, received ${receivedAmount}`);

    // Update payment with mismatch info but don't complete
    payment.paymentDetails = {
      ...payment.paymentDetails,
      webhookData,
      amountMismatch: true,
      receivedAmount
    };
    await payment.save();

    return {
      success: false,
      message: 'Amount mismatch',
      expected: expectedAmount,
      received: receivedAmount
    };
  }

  // Complete the payment
  payment.status = PAYMENT_STATUS.COMPLETED;
  payment.paidAt = new Date(transactionDate) || new Date();
  payment.paymentDetails = {
    ...payment.paymentDetails,
    webhookData,
    sepayId: id,
    gateway,
    referenceCode
  };
  await payment.save();

  // Update bill
  const bill = await Bill.findById(payment.bill);
  if (bill && bill.status !== BILL_STATUS.PAID) {
    bill.status = BILL_STATUS.PAID;
    bill.closedAt = new Date();
    await bill.save();

    // End sessions
    await TableSession.updateMany(
      { bill: bill._id, isActive: true },
      { isActive: false, leftAt: new Date() }
    );

    // Update table
    await Table.findByIdAndUpdate(bill.table, {
      status: TABLE_STATUS.CLEANING
    });
  }

  // TODO: Emit socket event for real-time notification
  // socketService.emitToRoom(`bill:${payment.bill}`, 'payment:completed', { paymentId: payment._id });

  return {
    success: true,
    message: 'Payment confirmed',
    paymentId: payment._id,
    billId: payment.bill
  };
};

/**
 * Get payment by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment details
 */
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findById(paymentId)
    .populate('bill', 'billNumber totalAmount table')
    .populate('processedBy', 'name employeeCode')
    .lean();

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  return formatPayment(payment);
};

/**
 * Get payment status for a bill
 * @param {string} billId - Bill ID
 * @returns {Promise<Object>} Payment status
 */
const getPaymentStatus = async (billId) => {
  const payment = await Payment.findOne({ bill: billId })
    .sort({ createdAt: -1 })
    .lean();

  if (!payment) {
    return { status: 'no_payment', payment: null };
  }

  const result = {
    status: payment.status,
    payment: formatPayment(payment)
  };

  // Add expiry info for pending QR payments
  if (payment.status === PAYMENT_STATUS.PENDING && payment.method === 'qr_banking') {
    const expiresAt = new Date(payment.createdAt.getTime() + config.qrExpiryMinutes * 60 * 1000);
    result.expiresAt = expiresAt;
    result.isExpired = new Date() > expiresAt;
  }

  return result;
};

/**
 * Get payment history for user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated payment history
 */
const getPaymentHistory = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;

  // Get user's bills through sessions
  const sessions = await TableSession.find({ user: userId })
    .select('bill')
    .lean();

  const billIds = [...new Set(sessions.map(s => s.bill).filter(Boolean))];

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find({
      bill: { $in: billIds },
      status: PAYMENT_STATUS.COMPLETED
    })
      .populate('bill', 'billNumber totalAmount')
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments({
      bill: { $in: billIds },
      status: PAYMENT_STATUS.COMPLETED
    })
  ]);

  return {
    payments: payments.map(formatPayment),
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
 * Cancel pending payment
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Cancelled payment
 */
const cancelPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw new ConflictError('Only pending payments can be cancelled');
  }

  payment.status = PAYMENT_STATUS.FAILED;
  payment.note = 'Cancelled by user';
  await payment.save();

  // Revert bill status if it was requesting payment
  const bill = await Bill.findById(payment.bill);
  if (bill && bill.status === BILL_STATUS.REQUESTING_PAYMENT) {
    bill.status = BILL_STATUS.OPEN;
    bill.paymentRequestedAt = null;
    await bill.save();
  }

  return formatPayment(payment);
};

/**
 * Refund payment
 * @param {string} paymentId - Payment ID
 * @param {Object} options - Refund options
 * @param {Object} staff - Staff processing refund
 * @returns {Promise<Object>} Refunded payment
 */
const refundPayment = async (paymentId, options, staff) => {
  const { reason, amount } = options;

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  if (payment.status !== PAYMENT_STATUS.COMPLETED) {
    throw new ConflictError('Only completed payments can be refunded');
  }

  const refundAmount = amount || payment.amount;

  if (refundAmount > payment.amount) {
    throw new ValidationError('Refund amount cannot exceed payment amount');
  }

  // Create refund record (negative payment)
  const refund = await Payment.create({
    bill: payment.bill,
    processedBy: staff?._id,
    amount: -refundAmount,
    method: payment.method,
    status: PAYMENT_STATUS.REFUNDED,
    transactionId: `REFUND-${payment.transactionId}`,
    note: reason,
    paymentDetails: {
      originalPaymentId: payment._id,
      refundReason: reason
    },
    paidAt: new Date()
  });

  // Update original payment
  payment.status = PAYMENT_STATUS.REFUNDED;
  payment.paymentDetails = {
    ...payment.paymentDetails,
    refundId: refund._id,
    refundedAt: new Date(),
    refundedBy: staff?._id
  };
  await payment.save();

  // If full refund, reopen bill
  if (refundAmount === payment.amount) {
    const bill = await Bill.findById(payment.bill);
    if (bill) {
      bill.status = BILL_STATUS.OPEN;
      bill.closedAt = null;
      bill.cashier = null;
      await bill.save();
    }
  }

  return formatPayment(refund);
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique transaction ID
 */
const generateTransactionId = (bill) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const billNum = bill.billNumber.replace(/[^A-Z0-9]/gi, '').slice(-4);
  return `QRD${billNum}${timestamp}${random}`;
};

/**
 * Extract transaction ID from payment content
 */
const extractTransactionId = (content) => {
  if (!content) return null;

  // Look for QRD pattern
  const match = content.match(/QRD[A-Z0-9]+/i);
  return match ? match[0].toUpperCase() : null;
};

/**
 * Build VietQR content string
 */
const buildVietQRContent = ({ bankBin, accountNumber, amount, description }) => {
  // EMVCo QR format
  const data = [
    '000201', // Payload Format Indicator
    '010212', // Point of Initiation Method (dynamic)
    `38${(15 + bankBin.length + accountNumber.length).toString().padStart(2, '0')}`, // Merchant Account Info
    `0006${bankBin}`, // Bank BIN
    `01${accountNumber.length.toString().padStart(2, '0')}${accountNumber}`, // Account Number
    '5303704', // Transaction Currency (VND)
    `54${amount.toString().length.toString().padStart(2, '0')}${amount}`, // Transaction Amount
    '5802VN', // Country Code
    `62${(4 + description.length).toString().padStart(2, '0')}08${description.length.toString().padStart(2, '0')}${description}` // Additional Data
  ];

  return data.join('');
};

/**
 * Build VietQR URL for QR code generation
 * Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACC_NAME>
 */
const buildVietQRUrl = ({ bankBin, accountNumber, accountName, amount, description }) => {
  const baseUrl = 'https://img.vietqr.io/image';
  const template = 'compact2'; // or 'compact', 'qr_only', 'print'

  // Encode parameters properly - VietQR requires specific encoding
  const encodedAccountName = encodeURIComponent(accountName || '');
  const encodedDescription = encodeURIComponent(description || '');

  return `${baseUrl}/${bankBin}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;
};

/**
 * Normalize IP address for comparison
 */
const normalizeIp = (ip) => {
  if (!ip) return '';
  // Handle IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  // Remove IPv6 prefix
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
};

/**
 * Format payment for API response
 */
const formatPayment = (payment) => {
  return {
    id: payment._id,
    bill: payment.bill ? {
      id: payment.bill._id || payment.bill,
      billNumber: payment.bill.billNumber || null,
      totalAmount: payment.bill.totalAmount || null
    } : null,
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
    transactionId: payment.transactionId,
    qrCodeUrl: payment.qrCodeUrl || null,
    bankCode: payment.bankCode || null,
    bankName: payment.bankName || null,
    processedBy: payment.processedBy ? {
      id: payment.processedBy._id || payment.processedBy,
      name: payment.processedBy.name || null
    } : null,
    note: payment.note || null,
    paidAt: payment.paidAt || null,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt
  };
};

/**
 * Format payment response with QR info
 */
const formatPaymentResponse = (payment, bill, expiresAt) => {
  return {
    payment: formatPayment(payment),
    qr: {
      url: payment.qrCodeUrl,
      bankName: config.bank.bankName,
      accountNumber: config.bank.accountNumber,
      accountName: config.bank.accountName,
      amount: payment.amount,
      description: payment.transactionId,
      expiresAt,
      expiresInSeconds: Math.max(0, Math.floor((expiresAt - new Date()) / 1000))
    },
    bill: {
      id: bill._id,
      billNumber: bill.billNumber,
      totalAmount: bill.totalAmount,
      tableNumber: bill.table?.tableNumber || null
    }
  };
};

module.exports = {
  generateVietQR,
  confirmPayment,
  handleSepayWebhook,
  getPaymentById,
  getPaymentStatus,
  getPaymentHistory,
  cancelPayment,
  refundPayment,
  formatPayment,
  config
};
