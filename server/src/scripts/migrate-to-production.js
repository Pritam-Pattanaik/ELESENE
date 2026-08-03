/**
 * Migration script for production database.
 *
 * Usage:
 *   node src/scripts/migrate-to-production.js
 *
 * This script:
 * 1. Authenticates to the production database via DATABASE_URL
 * 2. Runs all pending Sequelize migrations using sequelize-cli
 * 3. Verifies all 14 expected tables exist
 * 4. Reports row counts (should be 0 or minimal for fresh production)
 *
 * Prerequisites:
 * - server/.env.production must contain valid DATABASE_URL
 * - sequelize-cli must be installed (devDependency)
 * - Migrations are in server/src/migrations/
 */

require('../config/env');
const sequelize = require('../config/db');
const { execSync } = require('child_process');
const path = require('path');

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

async function runMigrations() {
  console.log(`\n[MIGRATE] Starting production migration...`);
  console.log(`[MIGRATE] Target DATABASE_URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/.*@/, '//***@') : 'NOT SET'}`);
  console.log(`[MIGRATE] NODE_ENV: ${process.env.NODE_ENV}`);

  if (!process.env.DATABASE_URL) {
    console.error('[MIGRATE] FATAL: DATABASE_URL is not set. Cannot run migrations.');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log('[MIGRATE] Database connection established.');
  } catch (err) {
    console.error('[MIGRATE] FATAL: Database authentication failed:', err.message);
    process.exit(1);
  }

  // Run sequelize-cli db:migrate
  console.log('[MIGRATE] Running sequelize-cli db:migrate...');
  try {
    const output = execSync('npx sequelize-cli db:migrate', {
      cwd: path.join(__dirname, '../../'),
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env },
    });
    console.log('[MIGRATE] Migrations executed successfully.');
    if (output) console.log(output.toString());
  } catch (e) {
    const errOutput = e.stdout?.toString() || e.message;
    console.error('[MIGRATE] Migration command failed:', errOutput);
    process.exit(1);
  }

  await verifyTables();
  await sequelize.close();
  console.log('\n[MIGRATE] Migration complete.\n');
}

async function verifyTables() {
  console.log('\n[VERIFY] Checking tables in production database...');

  const qi = sequelize.getQueryInterface();
  let tableNames;
  try {
    tableNames = await qi.showAllTables();
  } catch (e) {
    console.error('[VERIFY] Failed to list tables:', e.message);
    tableNames = [];
  }

  const missing = EXPECTED_TABLES.filter(t => !tableNames.includes(t));
  const extra = tableNames.filter(t => !EXPECTED_TABLES.includes(t) && t !== 'SequelizeMeta');

  if (missing.length === 0) {
    console.log(`[VERIFY] All ${EXPECTED_TABLES.length} expected tables exist.`);
  } else {
    console.error(`[VERIFY] MISSING tables: ${missing.join(', ')}`);
  }

  if (extra.length > 0) {
    console.warn(`[VERIFY] Extra tables found (not in expected list): ${extra.join(', ')}`);
  }

  console.log('\n[VERIFY] Row counts (should be empty or minimal for fresh production):');
  for (const table of EXPECTED_TABLES) {
    try {
      const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
      const count = result[0]?.count ?? 0;
      console.log(`  ${table}: ${count}`);
    } catch (e) {
      console.error(`  ${table}: ERROR - ${e.message}`);
    }
  }
}

runMigrations().catch(err => {
  console.error('[MIGRATE] Fatal error:', err);
  process.exit(1);
});
