/**
 * Database Seed Script
 * Populates test data for development and testing
 * Run with: node src/database/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

// Import models
const {
  User,
  Staff,
  Category,
  MenuItem,
  Area,
  Table
} = require('../models');

// Import database connection
const { connectDB, disconnectDB } = require('./connection');

// Seed data
const categoriesData = [
  { name: 'Khai vị', description: 'Các món khai vị', sortOrder: 1 },
  { name: 'Món chính', description: 'Các món chính', sortOrder: 2 },
  { name: 'Lẩu', description: 'Các loại lẩu', sortOrder: 3 },
  { name: 'Cơm', description: 'Các món cơm', sortOrder: 4 },
  { name: 'Mì - Phở', description: 'Các món mì, phở', sortOrder: 5 },
  { name: 'Đồ uống', description: 'Các loại đồ uống', sortOrder: 6 },
  { name: 'Tráng miệng', description: 'Các món tráng miệng', sortOrder: 7 }
];

const areasData = [
  { name: 'Tầng 1', description: 'Khu vực tầng 1', floor: 1, sortOrder: 1 },
  { name: 'Tầng 2', description: 'Khu vực tầng 2', floor: 2, sortOrder: 2 },
  { name: 'Sân vườn', description: 'Khu vực ngoài trời', floor: 1, sortOrder: 3 },
  { name: 'VIP Room', description: 'Phòng VIP', floor: 2, sortOrder: 4 }
];

// Menu items per category
const menuItemsData = {
  'Khai vị': [
    { name: 'Gỏi cuốn tôm thịt', price: 45000, description: '4 cuốn gỏi cuốn tôm thịt', preparationTime: 10, isPopular: true },
    { name: 'Chả giò rế', price: 55000, description: '6 chả giò rế giòn rụm', preparationTime: 15 },
    { name: 'Nem nướng Nha Trang', price: 65000, description: 'Nem nướng đặc sản Nha Trang', preparationTime: 20, isPopular: true },
    { name: 'Súp cua', price: 35000, description: 'Súp cua thơm ngon', preparationTime: 10 }
  ],
  'Món chính': [
    { name: 'Bò lúc lắc', price: 120000, description: 'Bò Úc lúc lắc với rau củ', preparationTime: 20, isPopular: true },
    { name: 'Gà nướng mật ong', price: 180000, description: 'Gà ta nướng mật ong nguyên con', preparationTime: 35 },
    { name: 'Cá lóc nướng trui', price: 150000, description: 'Cá lóc nướng trui cuốn bánh tráng', preparationTime: 30, isNew: true },
    { name: 'Sườn non xào chua ngọt', price: 95000, description: 'Sườn non xào chua ngọt', preparationTime: 25 },
    { name: 'Tôm rim thịt ba chỉ', price: 110000, description: 'Tôm sú rim với thịt ba chỉ', preparationTime: 20 }
  ],
  'Lẩu': [
    { name: 'Lẩu Thái hải sản', price: 280000, description: 'Lẩu Thái chua cay với hải sản tươi', preparationTime: 25, isPopular: true },
    { name: 'Lẩu gà lá é', price: 250000, description: 'Lẩu gà ta với lá é thơm', preparationTime: 25 },
    { name: 'Lẩu bò nhúng dấm', price: 290000, description: 'Lẩu bò nhúng dấm với rau sống', preparationTime: 20, isNew: true },
    { name: 'Lẩu cá kèo', price: 220000, description: 'Lẩu cá kèo đồng quê', preparationTime: 25 }
  ],
  'Cơm': [
    { name: 'Cơm chiên Dương Châu', price: 55000, description: 'Cơm chiên với tôm, trứng, lạp xưởng', preparationTime: 15, isPopular: true },
    { name: 'Cơm gà xối mỡ', price: 65000, description: 'Cơm gà giòn xối mỡ hành', preparationTime: 15 },
    { name: 'Cơm bò lúc lắc', price: 75000, description: 'Cơm với bò lúc lắc và trứng ốp la', preparationTime: 20 },
    { name: 'Cơm sườn nướng', price: 60000, description: 'Cơm sườn nướng mắm tỏi', preparationTime: 20 }
  ],
  'Mì - Phở': [
    { name: 'Phở bò tái', price: 55000, description: 'Phở bò tái truyền thống', preparationTime: 10, isPopular: true },
    { name: 'Phở bò chín', price: 55000, description: 'Phở bò chín nạm gầu', preparationTime: 10 },
    { name: 'Bún bò Huế', price: 60000, description: 'Bún bò Huế cay nồng', preparationTime: 15, isNew: true },
    { name: 'Mì Quảng', price: 55000, description: 'Mì Quảng tôm thịt', preparationTime: 15 },
    { name: 'Hủ tiếu Nam Vang', price: 50000, description: 'Hủ tiếu với nước lèo trong', preparationTime: 10 }
  ],
  'Đồ uống': [
    { name: 'Trà đào cam sả', price: 35000, description: 'Trà đào với cam tươi và sả', preparationTime: 5, isPopular: true },
    { name: 'Nước ép cam', price: 30000, description: 'Nước ép cam tươi', preparationTime: 5 },
    { name: 'Sinh tố bơ', price: 35000, description: 'Sinh tố bơ béo ngậy', preparationTime: 5, isPopular: true },
    { name: 'Cà phê sữa đá', price: 25000, description: 'Cà phê sữa đá truyền thống', preparationTime: 5 },
    { name: 'Coca Cola', price: 18000, description: 'Coca Cola lon', preparationTime: 1 },
    { name: '7 Up', price: 18000, description: '7 Up lon', preparationTime: 1 },
    { name: 'Nước suối', price: 12000, description: 'Nước suối Aquafina', preparationTime: 1 }
  ],
  'Tráng miệng': [
    { name: 'Chè thái', price: 30000, description: 'Chè Thái với nhiều topping', preparationTime: 5, isPopular: true },
    { name: 'Bánh flan', price: 25000, description: 'Bánh flan caramel', preparationTime: 5 },
    { name: 'Kem dừa', price: 35000, description: 'Kem dừa tươi mát', preparationTime: 5, isNew: true },
    { name: 'Trái cây tổng hợp', price: 45000, description: 'Dĩa trái cây theo mùa', preparationTime: 10 }
  ]
};

// Admin user data
const adminUserData = {
  email: 'admin@qrdatmon.com',
  name: 'Admin QRDatMon',
  authProvider: 'local',
  isGuest: false,
  isActive: true
};

const adminStaffData = {
  employeeCode: 'ADMIN001',
  role: 'admin',
  hireDate: new Date()
};

/**
 * Clear all existing data
 */
const clearData = async () => {
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    Category.deleteMany({}),
    MenuItem.deleteMany({}),
    Area.deleteMany({}),
    Table.deleteMany({})
  ]);
  console.log('✅ Data cleared');
};

/**
 * Seed categories
 */
const seedCategories = async () => {
  console.log('📁 Seeding categories...');
  const categories = await Category.insertMany(categoriesData);
  console.log(`✅ Created ${categories.length} categories`);
  return categories;
};

/**
 * Seed menu items
 */
const seedMenuItems = async (categories) => {
  console.log('🍽️  Seeding menu items...');

  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });

  let totalItems = 0;
  for (const [categoryName, items] of Object.entries(menuItemsData)) {
    const categoryId = categoryMap[categoryName];
    if (!categoryId) continue;

    const menuItems = items.map((item, index) => ({
      ...item,
      category: categoryId,
      sortOrder: index + 1,
      status: 'available',
      unit: 'phần'
    }));

    await MenuItem.insertMany(menuItems);
    totalItems += menuItems.length;
  }

  console.log(`✅ Created ${totalItems} menu items`);
};

/**
 * Seed areas
 */
const seedAreas = async () => {
  console.log('🏠 Seeding areas...');
  const areas = await Area.insertMany(areasData);
  console.log(`✅ Created ${areas.length} areas`);
  return areas;
};

/**
 * Seed tables
 */
const seedTables = async (areas) => {
  console.log('🪑 Seeding tables...');

  const tablesData = [];

  // Tầng 1: 10 tables
  const floor1 = areas.find(a => a.name === 'Tầng 1');
  if (floor1) {
    for (let i = 1; i <= 10; i++) {
      tablesData.push({
        area: floor1._id,
        tableNumber: `T1-${String(i).padStart(2, '0')}`,
        capacity: i <= 5 ? 4 : 6,
        position: { x: (i - 1) % 5 * 100, y: Math.floor((i - 1) / 5) * 100 },
        qrToken: crypto.randomBytes(16).toString('hex'),
        status: 'available',
        isActive: true
      });
    }
  }

  // Tầng 2: 8 tables
  const floor2 = areas.find(a => a.name === 'Tầng 2');
  if (floor2) {
    for (let i = 1; i <= 8; i++) {
      tablesData.push({
        area: floor2._id,
        tableNumber: `T2-${String(i).padStart(2, '0')}`,
        capacity: 4,
        position: { x: (i - 1) % 4 * 100, y: Math.floor((i - 1) / 4) * 100 },
        qrToken: crypto.randomBytes(16).toString('hex'),
        status: 'available',
        isActive: true
      });
    }
  }

  // Sân vườn: 6 tables
  const garden = areas.find(a => a.name === 'Sân vườn');
  if (garden) {
    for (let i = 1; i <= 6; i++) {
      tablesData.push({
        area: garden._id,
        tableNumber: `SV-${String(i).padStart(2, '0')}`,
        capacity: 6,
        position: { x: (i - 1) % 3 * 120, y: Math.floor((i - 1) / 3) * 120 },
        qrToken: crypto.randomBytes(16).toString('hex'),
        status: 'available',
        isActive: true
      });
    }
  }

  // VIP Room: 4 tables
  const vip = areas.find(a => a.name === 'VIP Room');
  if (vip) {
    for (let i = 1; i <= 4; i++) {
      tablesData.push({
        area: vip._id,
        tableNumber: `VIP-${String(i).padStart(2, '0')}`,
        capacity: 10,
        position: { x: (i - 1) % 2 * 150, y: Math.floor((i - 1) / 2) * 150 },
        qrToken: crypto.randomBytes(16).toString('hex'),
        status: 'available',
        isActive: true
      });
    }
  }

  const tables = await Table.insertMany(tablesData);
  console.log(`✅ Created ${tables.length} tables`);
  return tables;
};

/**
 * Seed admin user
 */
const seedAdminUser = async () => {
  console.log('👤 Seeding admin user...');

  // Check if admin already exists
  let adminUser = await User.findOne({ email: adminUserData.email });

  if (!adminUser) {
    adminUser = await User.create(adminUserData);
    console.log('✅ Created admin user');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Check if staff record exists
  let adminStaff = await Staff.findOne({ user: adminUser._id });

  if (!adminStaff) {
    adminStaff = await Staff.create({
      ...adminStaffData,
      user: adminUser._id
    });
    console.log('✅ Created admin staff record');
  } else {
    console.log('ℹ️  Admin staff record already exists');
  }

  return { user: adminUser, staff: adminStaff };
};

/**
 * Main seed function
 */
const seed = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out to keep existing data)
    await clearData();

    // Seed data
    const categories = await seedCategories();
    await seedMenuItems(categories);
    const areas = await seedAreas();
    const tables = await seedTables(areas);
    await seedAdminUser();

    console.log('\n✨ Database seeding completed successfully!\n');

    // Print summary
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Menu Items: ${Object.values(menuItemsData).flat().length}`);
    console.log(`   - Areas: ${areas.length}`);
    console.log(`   - Tables: ${tables.length}`);
    console.log(`   - Admin User: 1`);

    // Print sample QR token for testing
    console.log('\n🔑 Sample QR Token for testing:');
    console.log(`   Table: ${tables[0].tableNumber}`);
    console.log(`   Token: ${tables[0].qrToken}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
  } finally {
    await disconnectDB();
    process.exit();
  }
};

// Run seed
seed();
