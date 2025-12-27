/**
 * Table Status Scheduler
 * Automatically updates table statuses based on conditions:
 * - OCCUPIED tables with no orders for 30 minutes -> AVAILABLE
 * - CLEANING tables after 10 minutes -> AVAILABLE
 */

const cron = require('node-cron');
const { Table, Bill, Order, TableSession } = require('../models');
const { TABLE_STATUS, BILL_STATUS } = require('../utils/constants');
const { emitTableStatusChanged } = require('../socket/emitters');

// Time thresholds in milliseconds
const OCCUPIED_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const CLEANING_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Check and update occupied tables without orders
 * If a table is occupied but has no orders for 30 minutes, set it to available
 */
const checkOccupiedTables = async () => {
  try {
    console.log('[TableScheduler] Checking occupied tables...');
    
    // Find all occupied tables
    const occupiedTables = await Table.find({ 
      status: TABLE_STATUS.OCCUPIED,
      isActive: true 
    });

    const now = new Date();
    let updatedCount = 0;

    for (const table of occupiedTables) {
      // Find active bill for this table
      const bill = await Bill.findOne({
        table: table._id,
        status: { $in: [BILL_STATUS.OPEN, BILL_STATUS.REQUESTING_PAYMENT] }
      });

      if (!bill) {
        // No bill means no orders, check how long table has been occupied
        // Use table's updatedAt as reference
        const occupiedDuration = now - new Date(table.updatedAt);
        
        if (occupiedDuration >= OCCUPIED_TIMEOUT_MS) {
          console.log(`[TableScheduler] Table ${table.tableNumber} has no bill for ${Math.round(occupiedDuration / 60000)} minutes, setting to available`);
          
          // End all active sessions
          await TableSession.updateMany(
            { table: table._id, isActive: true },
            { isActive: false, leftAt: now }
          );
          
          // Set table to available
          table.status = TABLE_STATUS.AVAILABLE;
          await table.save();
          
          // Emit status change
          emitTableStatusChanged(table);
          updatedCount++;
        }
        continue;
      }

      // Check if bill has any orders
      const orderCount = await Order.countDocuments({ bill: bill._id });
      
      if (orderCount === 0) {
        // Bill exists but no orders, check bill creation time
        const billAge = now - new Date(bill.openedAt);
        
        if (billAge >= OCCUPIED_TIMEOUT_MS) {
          console.log(`[TableScheduler] Table ${table.tableNumber} has bill but no orders for ${Math.round(billAge / 60000)} minutes, setting to available`);
          
          // Delete the empty bill
          await Bill.findByIdAndDelete(bill._id);
          
          // End all active sessions
          await TableSession.updateMany(
            { table: table._id, isActive: true },
            { isActive: false, leftAt: now }
          );
          
          // Set table to available
          table.status = TABLE_STATUS.AVAILABLE;
          await table.save();
          
          // Emit status change
          emitTableStatusChanged(table);
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      console.log(`[TableScheduler] Updated ${updatedCount} occupied tables to available`);
    }
  } catch (error) {
    console.error('[TableScheduler] Error checking occupied tables:', error);
  }
};

/**
 * Check and update cleaning tables
 * If a table has been in cleaning status for 10 minutes, set it to available
 */
const checkCleaningTables = async () => {
  try {
    console.log('[TableScheduler] Checking cleaning tables...');
    
    // Find all cleaning tables
    const cleaningTables = await Table.find({ 
      status: TABLE_STATUS.CLEANING,
      isActive: true 
    });

    const now = new Date();
    let updatedCount = 0;

    for (const table of cleaningTables) {
      // Check how long table has been in cleaning status
      const cleaningDuration = now - new Date(table.updatedAt);
      
      if (cleaningDuration >= CLEANING_TIMEOUT_MS) {
        console.log(`[TableScheduler] Table ${table.tableNumber} has been cleaning for ${Math.round(cleaningDuration / 60000)} minutes, setting to available`);
        
        // Set table to available
        table.status = TABLE_STATUS.AVAILABLE;
        await table.save();
        
        // Emit status change
        emitTableStatusChanged(table);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`[TableScheduler] Updated ${updatedCount} cleaning tables to available`);
    }
  } catch (error) {
    console.error('[TableScheduler] Error checking cleaning tables:', error);
  }
};

/**
 * Run all table status checks
 */
const runTableStatusChecks = async () => {
  console.log('[TableScheduler] Running table status checks...');
  await checkOccupiedTables();
  await checkCleaningTables();
  console.log('[TableScheduler] Table status checks completed');
};

/**
 * Start the table status scheduler
 * Runs every 5 minutes
 */
const startTableStatusScheduler = () => {
  console.log('[TableScheduler] Starting table status scheduler...');
  
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await runTableStatusChecks();
  });

  // Also run immediately on startup
  runTableStatusChecks();
  
  console.log('[TableScheduler] Table status scheduler started (runs every 5 minutes)');
};

module.exports = {
  startTableStatusScheduler,
  runTableStatusChecks,
  checkOccupiedTables,
  checkCleaningTables
};
