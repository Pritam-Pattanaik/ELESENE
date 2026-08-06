/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — BRAND INVESTMENT TIER SEEDER
 * ══════════════════════════════════════════════════════════════════════════════
 */

require('../config/env');
const sequelize = require('../config/db');
const { LoyaltyTier } = require('../models');

const BRAND_TIERS = [
  {
    name: 'Seed',
    min_points: 0,
    max_points: 2999,
    sort_order: 1,
    perks: {
      title: 'Brand Explorer',
      earlyAccess: false,
      freeShipping: false,
      birthdayBonus: false,
    },
    is_active: true,
  },
  {
    name: 'Bronze',
    min_points: 3000,
    max_points: 7999,
    sort_order: 2,
    perks: {
      title: 'Brand Ally',
      earlyAccess: false,
      freeShipping: false,
      birthdayBonus: true,
    },
    is_active: true,
  },
  {
    name: 'Silver',
    min_points: 8000,
    max_points: 14999,
    sort_order: 3,
    perks: {
      title: 'Brand Patron',
      earlyAccess: true,
      freeShipping: true,
      birthdayBonus: true,
    },
    is_active: true,
  },
  {
    name: 'Gold',
    min_points: 15000,
    max_points: 29999,
    sort_order: 4,
    perks: {
      title: 'Brand Partner',
      earlyAccess: true,
      freeShipping: true,
      prioritySupport: true,
    },
    is_active: true,
  },
  {
    name: 'Platinum',
    min_points: 30000,
    max_points: 59999,
    sort_order: 5,
    perks: {
      title: 'Brand Ambassador',
      earlyAccess: true,
      freeShipping: true,
      vipEvents: true,
    },
    is_active: true,
  },
  {
    name: 'Diamond',
    min_points: 60000,
    max_points: null,
    sort_order: 6,
    perks: {
      title: 'Brand Guardian',
      earlyAccess: true,
      freeShipping: true,
      bespokeStylist: true,
    },
    is_active: true,
  },
];

async function seedTiers() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    for (const tierData of BRAND_TIERS) {
      const [tier, created] = await LoyaltyTier.findOrCreate({
        where: { name: tierData.name },
        defaults: tierData,
      });

      if (!created) {
        await tier.update(tierData);
        console.log(`Updated tier: ${tierData.name}`);
      } else {
        console.log(`Created tier: ${tierData.name}`);
      }
    }

    console.log('Brand Investment Tiers seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed tiers:', err);
    process.exit(1);
  }
}

seedTiers();
