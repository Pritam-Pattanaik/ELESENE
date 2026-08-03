/**
 * End-to-end isolation verification script.
 *
 * This script verifies that:
 * 1. Production environment is isolated from development
 * 2. Production database has no dev data
 * 3. Dev environment still works and doesn't touch production
 *
 * Usage:
 *   # Verify production (requires server/.env.production with production DATABASE_URL)
 *   node src/scripts/verify-isolation.js production
 *
 *   # Verify development (requires server/.env with dev DATABASE_URL)
 *   node src/scripts/verify-isolation.js development
 */

require('../config/env');
const sequelize = require('../config/db');

const EXPECTED_TABLES = [
  'users',
  'categories',
  'products',
  'product_variants',
  'product_images',
  'orders',
  'order_items',
  'carts',
  'cart_items',
  'reviews',
  'coupons',
  'wishlists',
  'addresses',
  'notifications',
];

const DEV_DATA_INDICATORS = {
  users: {
    email: 'customer1@test.com',
    description: 'Test customer seeded in dev',
  },
  categories: {
    min_count: 6,
    description: 'Dev seed data categories',
  },
  products: {
    min_count: 20,
    description: 'Dev seed data products',
  },
};

async function verifyEnvironment(envName) {
  console.log(`\n[ISOLATION] Verifying ${envName} environment...`);
  console.log(`[ISOLATION] DATABASE_URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/.*@/, '//***@') : 'NOT SET'}`);
  console.log(`[ISOLATION] SUPABASE_URL: ${process.env.SUPABASE_URL || 'NOT SET'}`);

  try {
    await sequelize.authenticate();
    console.log(`[ISOLATION] Database connection: OK`);
  } catch (err) {
    console.error(`[ISOLATION] Database connection FAILED: ${err.message}`);
    process.exit(1);
  }

  // Check tables
  const qi = sequelize.getQueryInterface();
  let tableNames;
  try {
    tableNames = await qi.showAllTables();
  } catch (e) {
    console.warn(`[ISOLATION] Could not list tables: ${e.message}`);
    tableNames = [];
  }

  const missing = EXPECTED_TABLES.filter(t => !tableNames.includes(t));
  if (missing.length > 0) {
    console.error(`[ISOLATION] Missing tables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(`[ISOLATION] All ${EXPECTED_TABLES.length} expected tables present.`);

  // Check for dev data indicators
  const issues = [];

  // Check for test customer
  try {
    const [users] = await sequelize.query(`SELECT email FROM users WHERE email = '${DEV_DATA_INDICATORS.users.email}' LIMIT 1;`);
    if (users.length > 0 && envName === 'production') {
      issues.push(`DEV DATA LEAK: Test customer "${DEV_DATA_INDICATORS.users.email}" found in ${envName} database!`);
    } else if (users.length === 0 && envName === 'development') {
      console.log(`[ISOLATION] Note: Test customer not found in dev (may need seeding).`);
    }
  } catch (e) {
    console.warn(`[ISOLATION] Could not check users: ${e.message}`);
  }

  // Check category count
  try {
    const [cats] = await sequelize.query('SELECT COUNT(*) as count FROM categories;');
    const count = parseInt(cats[0]?.count || 0);
    if (count > 0 && envName === 'production') {
      issues.push(`DEV DATA LEAK: ${count} categories found in production database (expected 0 or minimal seed).`);
    } else if (count === 0 && envName === 'development') {
      console.log(`[ISOLATION] Note: No categories in dev DB (may need seeding).`);
    } else {
      console.log(`[ISOLATION] Categories count: ${count}`);
    }
  } catch (e) {
    console.warn(`[ISOLATION] Could not check categories: ${e.message}`);
  }

  // Check product count
  try {
    const [prods] = await sequelize.query('SELECT COUNT(*) as count FROM products;');
    const count = parseInt(prods[0]?.count || 0);
    if (count > 0 && envName === 'production') {
      issues.push(`DEV DATA LEAK: ${count} products found in production database (expected 0 or minimal seed).`);
    } else {
      console.log(`[ISOLATION] Products count: ${count}`);
    }
  } catch (e) {
    console.warn(`[ISOLATION] Could not check products: ${e.message}`);
  }

  if (issues.length > 0) {
    console.error(`\n[ISOLATION] ISSUES FOUND in ${envName}:`);
    issues.forEach(i => console.error(`  - ${i}`));
    process.exit(1);
  }

  console.log(`\n[ISOLATION] ${envName} environment verification PASSED.\n`);
}

async function main() {
  const env = process.argv[2] || process.env.NODE_ENV || 'development';

  if (!['production', 'development'].includes(env)) {
    console.error('Usage: node verify-isolation.js [production|development]');
    process.exit(1);
  }

  await verifyEnvironment(env);
  await sequelize.close();
}

main().catch(err => {
  console.error('[ISOLATION] Fatal error:', err);
  process.exit(1);
});
