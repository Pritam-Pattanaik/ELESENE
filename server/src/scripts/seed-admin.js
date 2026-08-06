/**
 * Seed script to create default super admin and test customer users.
 * Run once: node src/scripts/seed-admin.js
 */
const bcrypt = require('bcryptjs');
require('../config/env')

const { User } = require('../models');
const sequelize = require('../config/db');

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@elesene.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'Elesene@2026';
const SUPERADMIN_NAME = 'Super Admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin_manager@elesene.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'EleseneAdmin@2026';
const ADMIN_NAME = 'Standard Admin';

async function seedUsers() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // 1. Seed Super Admin
    const existingSuperAdmin = await User.findOne({ where: { email: SUPERADMIN_EMAIL } });
    if (!existingSuperAdmin) {
      const salt = await bcrypt.genSalt(12);
      const password_hash = await bcrypt.hash(SUPERADMIN_PASSWORD, salt);
      await User.create({
        email: SUPERADMIN_EMAIL,
        full_name: SUPERADMIN_NAME,
        role: 'superadmin',
        password_hash,
        is_verified: true,
      });
      console.log(`Super admin created: ${SUPERADMIN_EMAIL} / ${SUPERADMIN_PASSWORD}`);
    } else {
      if (existingSuperAdmin.role !== 'superadmin') {
        existingSuperAdmin.role = 'superadmin';
        await existingSuperAdmin.save();
      }
      console.log(`Super admin ready: ${SUPERADMIN_EMAIL}`);
    }

    // 2. Seed Standard Admin
    const existingAdmin = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const password_hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      await User.create({
        email: ADMIN_EMAIL,
        full_name: ADMIN_NAME,
        role: 'admin',
        password_hash,
        is_verified: true,
      });
      console.log(`Standard admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    } else {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }
      console.log(`Standard admin ready: ${ADMIN_EMAIL}`);
    }

    // 2. Seed Test Customer
    const custEmail = 'customer1@test.com';
    const custPass = 'Password123';
    const custHash = await bcrypt.hash(custPass, 10);
    const [custUser, custCreated] = await User.findOrCreate({
      where: { email: custEmail },
      defaults: {
        email: custEmail,
        full_name: 'Test Customer',
        role: 'customer',
        password_hash: custHash,
        is_verified: true
      }
    });

    if (!custCreated && !custUser.password_hash) {
      custUser.password_hash = custHash;
      custUser.is_verified = true;
      await custUser.save();
    }
    console.log(`Test customer ready: ${custEmail} / ${custPass}`);

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed users:', error.message);
    process.exit(1);
  }
}

seedUsers();
