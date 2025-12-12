/**
 * Script khởi tạo database - tạo collections và indexes
 * Chạy: npm run db:init
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./connection');

// Import all models
const models = require('../models');

const initDatabase = async () => {
  console.log('Starting database initialization...\n');

  try {
    // Connect to MongoDB
    await connectDB();

    // Tạo collections
    const modelNames = Object.keys(models);
    
    for (const modelName of modelNames) {
      const Model = models[modelName];
      
      try {
        // Tạo collection
        await Model.createCollection();
        
        // Drop all indexes và tạo lại từ schema
        try {
          await Model.collection.dropIndexes();
        } catch (e) {
          // Ignore if no indexes to drop
        }
        
        // Sync indexes từ schema
        await Model.syncIndexes();
        console.log(`Created collection: ${Model.collection.name}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`Collection exists: ${Model.collection.name}`);
          try {
            await Model.collection.dropIndexes();
          } catch (e) {}
          await Model.syncIndexes();
        } else {
          console.error(`Error with ${Model.collection.name}:`, error.message);
        }
      }
    }

    console.log('\nDatabase initialization completed!');
    console.log(`Total collections: ${modelNames.length}`);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });

  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

initDatabase();
