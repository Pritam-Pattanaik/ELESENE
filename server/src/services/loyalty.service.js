/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — LOYALTY SERVICE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Core business logic for the loyalty points system.
 * Called by loyalty.controller and order hooks (order.controller / admin.controller).
 * Never called directly from routes.
 *
 * POINTS RATIO    : 1 pt per ₹100 of total_amount (floor)
 * RETURN WINDOW   : Lifetime maintained counter
 * FLAG THRESHOLD  : return_rate > 40% with ≥5 orders
 * REASON WEIGHTS  : size_fit/damaged/wrong/defective = 0.5, others = 1.0
 * TIERS           : Member 0-499 | Insider 500-1999 | Founder 2000+
 */

const sequelize = require('../config/db');
const { Op } = require('sequelize');
const {
  User,
  Order,
  LoyaltyTransaction,
  LoyaltyReturnStat,
  LoyaltyTier,
  LoyaltySettings,
} = require('../models');

// ─── Return-reason weight map ─────────────────────────────────────────────────
// Low-weight: genuine fit/quality issues that shouldn't penalise the customer
// Full-weight: discretionary or pattern returns
const REASON_WEIGHTS = {
  size_fit:             0.5,
  damaged_on_arrival:   0.5,
  wrong_item_received:  0.5,
  defective:            0.5,
  changed_mind:         1.0,
  found_cheaper:        1.0,
  no_longer_needed:     1.0,
  pattern_return:       1.0,
};

/**
 * Get or create LoyaltyReturnStat row for a user.
 * Uses findOrCreate to be safe against concurrent inserts.
 */
const getOrCreateReturnStat = async (userId, t = null) => {
  const [stat] = await LoyaltyReturnStat.findOrCreate({
    where: { user_id: userId },
    defaults: {
      user_id: userId,
      total_orders: 0,
      total_returns: 0,
      weighted_returns: 0,
      return_rate: 0,
      is_flagged: false,
      restriction_level: 'none',
    },
    ...(t && { transaction: t }),
  });
  return stat;
};

/**
 * Load program settings from DB, falling back to env/defaults.
 */
const getSettings = async () => {
  let settings = await LoyaltySettings.findByPk(1);
  if (!settings) {
    // Seed default settings row
    settings = await LoyaltySettings.create({
      id: 1,
      points_per_100_inr: Number(process.env.LOYALTY_POINTS_PER_100 || 1),
      return_flag_threshold_pct: Number(process.env.RETURN_FLAG_THRESHOLD || 40),
      return_flag_min_orders: 5,
    });
  }
  return settings;
};

/**
 * Determine which tier a given cumulative-points balance falls into.
 * Falls back to 'Member' if tiers table is empty.
 */
const evaluateTier = async (points) => {
  const tiers = await LoyaltyTier.findAll({
    where: { is_active: true },
    order: [['min_points', 'ASC']],
  });

  if (!tiers.length) return 'Member';

  let currentTier = tiers[0];
  for (const tier of tiers) {
    if (points >= tier.min_points) currentTier = tier;
  }
  return currentTier.name;
};

/**
 * Get all tiers and compute next-tier progress for a user's balance.
 */
const getTierProgress = async (points) => {
  const tiers = await LoyaltyTier.findAll({
    where: { is_active: true },
    order: [['min_points', 'ASC']],
  });

  if (!tiers.length) {
    return { currentTier: 'Member', nextTier: null, progressPct: 100, pointsToNext: 0, perks: {} };
  }

  let currentTierObj = tiers[0];
  for (const tier of tiers) {
    if (points >= tier.min_points) currentTierObj = tier;
  }

  const currentIdx = tiers.findIndex(t => t.id === currentTierObj.id);
  const nextTierObj = tiers[currentIdx + 1] || null;

  let progressPct = 100;
  let pointsToNext = 0;
  if (nextTierObj) {
    const range = nextTierObj.min_points - currentTierObj.min_points;
    const earned = points - currentTierObj.min_points;
    progressPct = Math.min(100, Math.round((earned / range) * 100));
    pointsToNext = nextTierObj.min_points - points;
  }

  return {
    currentTier: currentTierObj.name,
    nextTier: nextTierObj?.name || null,
    nextTierMinPoints: nextTierObj?.min_points || null,
    progressPct,
    pointsToNext: Math.max(0, pointsToNext),
    perks: currentTierObj.perks || {},
    allTiers: tiers,
  };
};

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Award points to a user when an order is completed (delivered).
 * Runs inside the caller's transaction if provided.
 *
 * @param {string} userId
 * @param {string} orderId
 * @param {number} totalAmount  — order.total_amount in INR
 * @param {object} [t]          — Sequelize transaction
 */
const awardPoints = async (userId, orderId, totalAmount, t = null) => {
  const settings = await getSettings();
  const ptsPerHundred = settings.points_per_100_inr;
  const pointsEarned = Math.floor(Number(totalAmount) / 100) * ptsPerHundred;

  if (pointsEarned <= 0) return { pointsEarned: 0 };

  const opts = t ? { transaction: t } : {};

  const user = await User.findByPk(userId, opts);
  if (!user) throw new Error(`User ${userId} not found for loyalty award`);

  const newBalance = user.loyalty_points + pointsEarned;
  const newTier = await evaluateTier(newBalance);

  await user.update({ loyalty_points: newBalance, loyalty_tier: newTier }, opts);

  await LoyaltyTransaction.create({
    user_id: userId,
    order_id: orderId,
    type: 'earn',
    points: pointsEarned,
    balance_after: newBalance,
    reason: `Order delivery reward (₹${Number(totalAmount).toFixed(2)})`,
  }, opts);

  // Store on the order how many points it awarded (for exact reversal)
  await Order.update({ points_awarded: pointsEarned }, { where: { id: orderId }, ...opts });

  // Update return stat: increment total_orders
  const stat = await getOrCreateReturnStat(userId, t);
  const newTotalOrders = stat.total_orders + 1;
  const newReturnRate = newTotalOrders > 0
    ? (Number(stat.weighted_returns) / newTotalOrders) * 100
    : 0;
  await stat.update({ total_orders: newTotalOrders, return_rate: newReturnRate }, opts);

  return { pointsEarned, newBalance, newTier };
};

/**
 * Reverse points when an order is returned/refunded.
 * Uses the stored order.points_awarded for exact reversal.
 * If reversal would push balance negative, flags the account instead.
 *
 * @param {string} userId
 * @param {string} orderId
 * @param {string|null} reasonCode  — return reason (affects weighted_returns)
 * @param {object} [t]              — Sequelize transaction
 */
const reversePoints = async (userId, orderId, reasonCode = null, t = null) => {
  const opts = t ? { transaction: t } : {};

  const order = await Order.findByPk(orderId, opts);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const pointsToReverse = order.points_awarded || 0;

  const user = await User.findByPk(userId, opts);
  if (!user) throw new Error(`User ${userId} not found`);

  let result = { pointsReversed: pointsToReverse, shortfall: 0, flagged: false };

  if (pointsToReverse > 0) {
    const currentBalance = user.loyalty_points;
    const canReverse = currentBalance >= pointsToReverse;

    if (canReverse) {
      const newBalance = currentBalance - pointsToReverse;
      const newTier = await evaluateTier(newBalance);

      await user.update({ loyalty_points: newBalance, loyalty_tier: newTier }, opts);

      await LoyaltyTransaction.create({
        user_id: userId,
        order_id: orderId,
        type: 'reversal',
        points: -pointsToReverse,
        balance_after: newBalance,
        reason: `Return reversal for order — reason: ${reasonCode || 'not specified'}`,
      }, opts);
    } else {
      // Cannot go negative — flag the account for shortfall
      const shortfall = pointsToReverse - currentBalance;
      result.shortfall = shortfall;
      result.flagged = true;

      // Log a partial reversal (zero out balance) + flag
      const newBalance = 0;
      const newTier = await evaluateTier(newBalance);

      await user.update({ loyalty_points: newBalance, loyalty_tier: newTier }, opts);

      await LoyaltyTransaction.create({
        user_id: userId,
        order_id: orderId,
        type: 'reversal',
        points: -currentBalance, // only reverse what's available
        balance_after: 0,
        reason: `Partial return reversal — shortfall of ${shortfall} pts flagged for admin review`,
      }, opts);

      // Flag in return stats
      const stat = await getOrCreateReturnStat(userId, t);
      await stat.update({
        is_flagged: true,
        flag_reason: `Points shortfall on return: needed ${pointsToReverse}, had ${currentBalance}. Shortfall: ${shortfall}`,
        flagged_at: new Date(),
      }, opts);
    }
  }

  // Update return stats: increment weighted_returns based on reason
  const weight = REASON_WEIGHTS[reasonCode] ?? 1.0;
  const stat = await getOrCreateReturnStat(userId, t);

  const settings = await getSettings();
  const newTotalReturns = stat.total_returns + 1;
  const newWeightedReturns = Number(stat.weighted_returns) + weight;
  const newReturnRate = stat.total_orders > 0
    ? (newWeightedReturns / stat.total_orders) * 100
    : 0;

  const shouldFlag = stat.total_orders >= settings.return_flag_min_orders
    && newReturnRate > Number(settings.return_flag_threshold_pct);

  const updatePayload = {
    total_returns: newTotalReturns,
    weighted_returns: newWeightedReturns,
    return_rate: newReturnRate,
  };

  if (shouldFlag && !stat.is_flagged) {
    updatePayload.is_flagged = true;
    updatePayload.flag_reason = `Return rate ${newReturnRate.toFixed(1)}% exceeded ${settings.return_flag_threshold_pct}% threshold after ${stat.total_orders} orders`;
    updatePayload.flagged_at = new Date();
    result.flagged = true;
  }

  await stat.update(updatePayload, opts);

  return result;
};

/**
 * Manually adjust a user's points balance (customer service).
 * Always creates an audit trail with admin user ID and reason.
 *
 * @param {string} userId
 * @param {number} points      — positive = add, negative = deduct
 * @param {string} reason
 * @param {string} adminId
 */
const adjustPoints = async (userId, points, reason, adminId) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) throw new Error('User not found');

    const newBalance = Math.max(0, user.loyalty_points + points);
    const newTier = await evaluateTier(newBalance);

    await user.update({ loyalty_points: newBalance, loyalty_tier: newTier }, { transaction: t });

    await LoyaltyTransaction.create({
      user_id: userId,
      order_id: null,
      type: 'adjustment',
      points,
      balance_after: newBalance,
      reason: reason || 'Admin manual adjustment',
      created_by: adminId,
    }, { transaction: t });

    await t.commit();
    return { newBalance, newTier };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/**
 * Get full loyalty summary for a user (balance, tier, progress, return stats).
 */
const getBalance = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'full_name', 'email', 'loyalty_points', 'loyalty_tier'],
  });
  if (!user) throw new Error('User not found');

  const tierProgress = await getTierProgress(user.loyalty_points);
  const returnStat = await LoyaltyReturnStat.findOne({ where: { user_id: userId } });

  return {
    balance: user.loyalty_points,
    ...tierProgress,
    returnStat: returnStat || null,
  };
};

/**
 * Paginated transaction history for a user.
 */
const getHistory = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await LoyaltyTransaction.findAndCountAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
  return { total: count, page, limit, transactions: rows };
};

/**
 * Program-wide stats for admin dashboard.
 */
const getProgramStats = async () => {
  const [totalPointsIssued, totalPointsReversed, flaggedCount] = await Promise.all([
    LoyaltyTransaction.sum('points', { where: { type: 'earn' } }),
    LoyaltyTransaction.sum('points', { where: { type: 'reversal' } }),
    LoyaltyReturnStat.count({ where: { is_flagged: true } }),
  ]);

  // Tier distribution
  const tierDist = await User.findAll({
    attributes: ['loyalty_tier', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where: { role: 'customer' },
    group: ['loyalty_tier'],
    raw: true,
  });

  return {
    totalPointsIssued: totalPointsIssued || 0,
    totalPointsReversed: Math.abs(totalPointsReversed || 0),
    netPointsOutstanding: (totalPointsIssued || 0) + (totalPointsReversed || 0),
    flaggedAccounts: flaggedCount,
    tierDistribution: tierDist,
  };
};

module.exports = {
  awardPoints,
  reversePoints,
  adjustPoints,
  getBalance,
  getHistory,
  getProgramStats,
  evaluateTier,
  getTierProgress,
  getSettings,
};
