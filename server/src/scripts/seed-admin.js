/**
 * Seed script to create the default super admin user.
 * Run once: node src/scripts/seed-admin.js
 */
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Initialize Sequelize + models (triggers associations)
const { User } = require('../models');
const sequelize = require('../config/db');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@elesene.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Elesene@2026';
const ADMIN_NAME = 'Super Admin';

async function seedAdmin() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // Check if admin already exists
    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      if (existing.role !== 'superadmin') {
        existing.role = 'superadmin';
        await existing.save();
        console.log('Updated role to superadmin.');
      }
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create superadmin
    const admin = await User.create({
      email: ADMIN_EMAIL,
      full_name: ADMIN_NAME,
      role: 'superadmin',
      password_hash,
      is_verified: true,
    });

    console.log(`Super admin created successfully!`);
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  ID: ${admin.id}`);
    console.log('\n⚠ Change this password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
