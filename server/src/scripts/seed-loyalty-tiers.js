/**
 * Seed default loyalty tiers and settings.
 * Safe to run multiple times (upserts via findOrCreate).
 * Run: node server/src/scripts/seed-loyalty-tiers.js
 */

require('../config/env');
const sequelize = require('../config/db');
const { LoyaltyTier, LoyaltySettings } = require('../models/LoyaltyTier');

const DEFAULT_TIERS = [
  {
    name: 'Member',
    min_points: 0,
    max_points: 499,
    sort_order: 1,
    perks: {
      early_access_hours: 0,
      birthday_discount_pct: 5,
      free_shipping: false,
      invite_events: false,
      priority_support: false,
    },
    is_active: true,
  },
  {
    name: 'Insider',
    min_points: 500,
    max_points: 1999,
    sort_order: 2,
    perks: {
      early_access_hours: 48,
      birthday_discount_pct: 8,
      free_shipping: false,
      invite_events: false,
      priority_support: true,
    },
    is_active: true,
  },
  {
    name: 'Founder',
    min_points: 2000,
    max_points: null,
    sort_order: 3,
    perks: {
      early_access_hours: 72,
      birthday_discount_pct: 15,
      free_shipping: true,
      invite_events: true,
      priority_support: true,
    },
    is_active: true,
  },
];

const seed = async () => {
  await sequelize.authenticate();
  console.log('[Seed] DB connected');

  for (const tier of DEFAULT_TIERS) {
    const [row, created] = await LoyaltyTier.findOrCreate({
      where: { name: tier.name },
      defaults: tier,
    });
    if (!created) {
      await row.update(tier);
      console.log(`[Seed] Updated tier: ${tier.name}`);
    } else {
      console.log(`[Seed] Created tier: ${tier.name}`);
    }
  }

  // Seed settings singleton
  const [settings, created] = await LoyaltySettings.findOrCreate({
    where: { id: 1 },
    defaults: {
      id: 1,
      points_per_100_inr: Number(process.env.LOYALTY_POINTS_PER_100 || 1),
      return_flag_threshold_pct: Number(process.env.RETURN_FLAG_THRESHOLD || 40),
      return_flag_min_orders: 5,
    },
  });
  console.log(`[Seed] Loyalty settings ${created ? 'created' : 'already exist'}`);

  console.log('[Seed] Done.');
  process.exit(0);
};

seed().catch(err => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
