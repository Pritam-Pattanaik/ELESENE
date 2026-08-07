/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — BRAND INVESTMENT SERVICE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Core engine for customer lifetime brand investment, dynamic tier calculations,
 * spendable reward redemption, and engagement point accruals.
 *
 * CORE FORMULA:
 * - ₹1 spent -> 1 Investment Point (IP) [Lifetime metric, never decreases, never expires]
 * - ₹100 spent -> 1 Loyalty Point (LP) [Spendable reward metric]
 *
 * DEFAULT TIER HIERARCHY:
 * - Seed     : 0 - 2,999 IP
 * - Bronze   : 3,000 - 7,999 IP
 * - Silver   : 8,000 - 14,999 IP
 * - Gold     : 15,000 - 29,999 IP
 * - Platinum : 30,000 - 59,999 IP
 * - Diamond  : 60,000+ IP
 */

const sequelize = require('../config/db');
const { Op } = require('sequelize');
const {
  User,
  Order,
  LoyaltyTier,
  InvestmentTransaction,
  InvestmentTierHistory,
  RewardRedemption,
  EngagementActivity,
  Notification,
} = require('../models');

// Standard Tier Definitions fallback
const BRAND_TIERS_DEFAULT = [
  { name: 'Seed', minPoints: 0, maxPoints: 2999, perks: { title: 'Brand Explorer', earlyAccess: false, freeShipping: false } },
  { name: 'Bronze', minPoints: 3000, maxPoints: 7999, perks: { title: 'Brand Ally', earlyAccess: false, freeShipping: false, birthdayBonus: true } },
  { name: 'Silver', minPoints: 8000, maxPoints: 14999, perks: { title: 'Brand Patron', earlyAccess: true, freeShipping: true } },
  { name: 'Gold', minPoints: 15000, maxPoints: 29999, perks: { title: 'Brand Partner', earlyAccess: true, freeShipping: true, prioritySupport: true } },
  { name: 'Platinum', minPoints: 30000, maxPoints: 59999, perks: { title: 'Brand Ambassador', earlyAccess: true, freeShipping: true, vipEvents: true } },
  { name: 'Diamond', minPoints: 60000, maxPoints: null, perks: { title: 'Brand Guardian', earlyAccess: true, freeShipping: true, bespokeStylist: true } },
];

/**
 * Determine dynamic tier object based on current IP balance
 */
const evaluateInvestmentTier = async (investmentPoints) => {
  const dbTiers = await LoyaltyTier.findAll({
    where: { is_active: true },
    order: [['min_points', 'ASC']],
  }).catch(() => []);

  if (dbTiers && dbTiers.length > 0) {
    let currentTier = dbTiers[0];
    for (const tier of dbTiers) {
      if (investmentPoints >= tier.min_points) {
        currentTier = tier;
      }
    }
    return currentTier.name;
  }

  // Fallback to standard 6-tier hierarchy
  let currentTier = BRAND_TIERS_DEFAULT[0];
  for (const tier of BRAND_TIERS_DEFAULT) {
    if (investmentPoints >= tier.minPoints) {
      currentTier = tier;
    }
  }
  return currentTier.name;
};

/**
 * Calculate progress percentage and points to next tier
 */
const getInvestmentTierProgress = async (investmentPoints) => {
  const dbTiers = await LoyaltyTier.findAll({
    where: { is_active: true },
    order: [['min_points', 'ASC']],
  }).catch(() => []);

  let tiers = BRAND_TIERS_DEFAULT.map(t => ({
    name: t.name,
    min_points: t.minPoints,
    max_points: t.maxPoints,
    perks: t.perks,
  }));

  if (dbTiers && dbTiers.length > 0) {
    tiers = dbTiers.map(t => ({
      name: t.name,
      min_points: t.min_points,
      max_points: t.max_points,
      perks: t.perks,
    }));
  }

  let currentTierObj = tiers[0];
  for (const tier of tiers) {
    if (investmentPoints >= tier.min_points) {
      currentTierObj = tier;
    }
  }

  const currentIdx = tiers.findIndex(t => t.name === currentTierObj.name);
  const nextTierObj = tiers[currentIdx + 1] || null;

  let progressPct = 100;
  let pointsToNext = 0;

  if (nextTierObj) {
    const range = nextTierObj.min_points - currentTierObj.min_points;
    const earned = investmentPoints - currentTierObj.min_points;
    progressPct = Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
    pointsToNext = Math.max(0, nextTierObj.min_points - investmentPoints);
  }

  return {
    currentTier: currentTierObj.name,
    nextTier: nextTierObj ? nextTierObj.name : null,
    nextTierMinPoints: nextTierObj ? nextTierObj.min_points : null,
    progressPct,
    pointsToNext,
    perks: currentTierObj.perks || {},
    allTiers: tiers,
  };
};

/**
 * Process purchase investment points and loyalty rewards upon completed order payment
 */
const awardPurchaseInvestment = async (userId, orderId, totalAmount, campaignId = null, multiplier = 1.0, t = null) => {
  const amountNum = Number(totalAmount) || 0;
  if (amountNum <= 0) return { ipEarned: 0, lpEarned: 0 };

  const mult = Math.max(1.0, Number(multiplier) || 1.0);
  const ipEarned = Math.floor(amountNum * mult);
  const lpEarned = Math.floor((amountNum / 100) * mult);

  const opts = t ? { transaction: t } : {};

  const user = await User.findByPk(userId, opts);
  if (!user) throw new Error(`User ${userId} not found`);

  const oldTier = user.investmentTier || user.loyalty_tier || 'Seed';
  const newIp = (user.investmentPoints || 0) + ipEarned;
  const newLp = (user.loyaltyPoints || user.loyalty_points || 0) + lpEarned;
  const newLifetimeAmount = Number(user.lifetimeInvestmentAmount || 0) + amountNum;
  const newTotalSpent = Number(user.totalSpent || 0) + amountNum;
  const newTotalOrders = (user.totalOrders || 0) + 1;

  const newTier = await evaluateInvestmentTier(newIp);
  const tierProgress = await getInvestmentTierProgress(newIp);

  await user.update({
    investmentPoints: newIp,
    loyaltyPoints: newLp,
    loyalty_points: newLp,
    lifetimeInvestmentAmount: newLifetimeAmount,
    totalSpent: newTotalSpent,
    totalOrders: newTotalOrders,
    investmentTier: newTier,
    loyalty_tier: newTier,
    nextTierProgress: tierProgress.progressPct,
    ...(oldTier !== newTier && { tierAchievedAt: new Date() }),
  }, opts);

  // Audit transaction log
  await InvestmentTransaction.create({
    userId,
    orderId,
    source: 'purchase',
    amount: amountNum,
    investmentPoints: ipEarned,
    loyaltyPoints: lpEarned,
    multiplier: mult,
    description: `Brand Investment from purchase (₹${amountNum.toFixed(2)}${mult > 1 ? ` @ ${mult}x bonus` : ''})`,
  }, opts);

  // Log order investment earnings
  await Order.update({
    investmentPointsEarned: ipEarned,
    loyaltyPointsEarned: lpEarned,
    rewardMultiplier: mult,
    campaignId: campaignId || null,
  }, { where: { id: orderId }, ...opts });

  // Log tier history if promoted
  if (oldTier !== newTier) {
    await InvestmentTierHistory.create({
      userId,
      previousTier: oldTier,
      newTier,
      investmentPointsAtChange: newIp,
      reason: `Tier elevated to ${newTier} via brand investment purchase`,
    }, opts);

    // Notify user of tier unlock
    await Notification.create({
      user_id: userId,
      type: 'tier_upgrade',
      title: `Welcome to ${newTier} Tier!`,
      message: `Your brand investment has reached ${newIp.toLocaleString()} IP. Enjoy new privileges as a ${newTier} member.`,
    }, opts).catch(() => {});
  }

  return {
    ipEarned,
    lpEarned,
    newIp,
    newLp,
    newTier,
    tierUpgraded: oldTier !== newTier,
  };
};

/**
 * Award engagement bonus points (Reviews, Referrals, Profile Completion, Social Shares)
 */
const awardEngagementBonus = async (userId, activityType, referenceId = null, customIp = null, customLp = null, t = null) => {
  const BONUS_MAP = {
    review: { ip: 20, lp: 2, desc: 'Product Review Engagement Bonus' },
    referral: { ip: 300, lp: 30, desc: 'Brand Ambassador Referral Reward' },
    profile_completion: { ip: 50, lp: 5, desc: 'Profile & Persona Completion' },
    social_share: { ip: 25, lp: 2, desc: 'Social Media Engagement Share' },
  };

  const config = BONUS_MAP[activityType] || { ip: customIp || 10, lp: customLp || 1, desc: 'Brand Engagement Reward' };
  const ipBonus = customIp !== null ? customIp : config.ip;
  const lpBonus = customLp !== null ? customLp : config.lp;

  const opts = t ? { transaction: t } : {};

  const user = await User.findByPk(userId, opts);
  if (!user) throw new Error(`User ${userId} not found`);

  // Prevent duplicate one-time claims (profile_completion)
  if (activityType === 'profile_completion') {
    const existing = await EngagementActivity.findOne({
      where: { userId, activityType: 'profile_completion' },
      ...opts,
    });
    if (existing) {
      return { awarded: false, message: 'Profile completion bonus already claimed.' };
    }
  }

  const oldTier = user.investmentTier || 'Seed';
  const newIp = (user.investmentPoints || 0) + ipBonus;
  const newLp = (user.loyaltyPoints || 0) + lpBonus;
  const newEngagementScore = (user.engagementScore || 0) + ipBonus;

  const newTier = await evaluateInvestmentTier(newIp);
  const tierProgress = await getInvestmentTierProgress(newIp);

  await user.update({
    investmentPoints: newIp,
    loyaltyPoints: newLp,
    loyalty_points: newLp,
    engagementScore: newEngagementScore,
    investmentTier: newTier,
    loyalty_tier: newTier,
    nextTierProgress: tierProgress.progressPct,
    ...(oldTier !== newTier && { tierAchievedAt: new Date() }),
  }, opts);

  await EngagementActivity.create({
    userId,
    activityType,
    referenceId: referenceId ? String(referenceId) : null,
    ipAwarded: ipBonus,
    lpAwarded: lpBonus,
  }, opts);

  await InvestmentTransaction.create({
    userId,
    source: activityType,
    amount: 0,
    investmentPoints: ipBonus,
    loyaltyPoints: lpBonus,
    multiplier: 1.00,
    description: config.desc,
  }, opts);

  return {
    awarded: true,
    ipBonus,
    lpBonus,
    newIp,
    newLp,
    newTier,
  };
};

/**
 * Redeem spendable Loyalty Points (LP) for vouchers or rewards
 * NOTE: LP redemptions NEVER reduce Investment Points (IP) or Tier status!
 */
const redeemLoyaltyPoints = async (userId, rewardTitle, rewardType, lpCost, t = null) => {
  const opts = t ? { transaction: t } : {};
  const cost = Math.max(1, parseInt(lpCost));

  const user = await User.findByPk(userId, opts);
  if (!user) throw new Error('User not found');

  const currentLp = user.loyaltyPoints || user.loyalty_points || 0;
  if (currentLp < cost) {
    throw new Error(`Insufficient Loyalty Points balance. Needed: ${cost}, Available: ${currentLp}`);
  }

  const newLp = currentLp - cost;
  await user.update({
    loyaltyPoints: newLp,
    loyalty_points: newLp,
  }, opts);

  // Generate unique coupon code
  const couponCode = `ELESENE-REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const redemption = await RewardRedemption.create({
    userId,
    rewardTitle,
    rewardType,
    loyaltyPointsSpent: cost,
    couponCodeGenerated: couponCode,
    status: 'active',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
  }, opts);

  await InvestmentTransaction.create({
    userId,
    source: 'redemption',
    amount: 0,
    investmentPoints: 0, // IP never decreases!
    loyaltyPoints: -cost,
    multiplier: 1.00,
    description: `Redeemed ${cost} LP for ${rewardTitle} (${couponCode})`,
  }, opts);

  return {
    success: true,
    couponCode,
    newLp,
    redemption,
  };
};

/**
 * Retrieve comprehensive summary dashboard data for a customer
 */
const getUserInvestmentSummary = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      'id', 'full_name', 'email', 'referral_code', 'profile_picture',
      'lifetimeInvestmentAmount', 'investmentPoints', 'loyaltyPoints',
      'investmentTier', 'tierAchievedAt', 'nextTierProgress',
      'totalReferrals', 'engagementScore', 'investmentLevel', 'totalOrders', 'totalSpent'
    ],
  });

  if (!user) throw new Error('User not found');

  const ip = user.investmentPoints || 0;
  const tierProgress = await getInvestmentTierProgress(ip);

  const [recentTransactions, activeRedemptions, engagementLogs] = await Promise.all([
    InvestmentTransaction.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit: 10,
    }),
    RewardRedemption.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit: 10,
    }),
    EngagementActivity.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit: 10,
    }),
  ]);

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      referralCode: user.referral_code,
      profilePicture: user.profile_picture,
    },
    metrics: {
      lifetimeInvestmentAmount: Number(user.lifetimeInvestmentAmount || 0),
      investmentPoints: user.investmentPoints || 0,
      loyaltyPoints: user.loyaltyPoints || 0,
      investmentTier: user.investmentTier || 'Seed',
      tierAchievedAt: user.tierAchievedAt,
      totalReferrals: user.totalReferrals || 0,
      engagementScore: user.engagementScore || 0,
      totalOrders: user.totalOrders || 0,
      totalSpent: Number(user.totalSpent || 0),
    },
    progress: tierProgress,
    recentTransactions,
    activeRedemptions,
    engagementLogs,
  };
};

/**
 * Retrieve paginated transaction history
 */
const getInvestmentTransactionsHistory = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await InvestmentTransaction.findAndCountAll({
    where: { userId },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return { total: count, page, limit, transactions: rows };
};

/**
 * Admin manual adjustment of Investment Points & Loyalty Points with audit trail
 */
const adjustUserInvestmentPoints = async (userId, ipAmount, lpAmount, reason, adminId) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) throw new Error('User not found');

    const oldTier = user.investmentTier || 'Seed';
    const newIp = Math.max(0, (user.investmentPoints || 0) + parseInt(ipAmount || 0));
    const newLp = Math.max(0, (user.loyaltyPoints || 0) + parseInt(lpAmount || 0));

    const newTier = await evaluateInvestmentTier(newIp);
    const tierProgress = await getInvestmentTierProgress(newIp);

    await user.update({
      investmentPoints: newIp,
      loyaltyPoints: newLp,
      loyalty_points: newLp,
      investmentTier: newTier,
      loyalty_tier: newTier,
      nextTierProgress: tierProgress.progressPct,
    }, { transaction: t });

    await InvestmentTransaction.create({
      userId,
      source: 'admin_adjustment',
      amount: 0,
      investmentPoints: parseInt(ipAmount || 0),
      loyaltyPoints: parseInt(lpAmount || 0),
      multiplier: 1.00,
      description: reason || 'Admin manual point adjustment',
      createdBy: adminId,
    }, { transaction: t });

    if (oldTier !== newTier) {
      await InvestmentTierHistory.create({
        userId,
        previousTier: oldTier,
        newTier,
        investmentPointsAtChange: newIp,
        reason: `Tier manually adjusted by admin: ${reason}`,
      }, { transaction: t });
    }

    await t.commit();
    return { success: true, newIp, newLp, newTier };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/**
 * Retrieve program-wide analytics for Admin Dashboard
 */
const getAdminInvestmentAnalytics = async () => {
  const [totalIp, totalLp, totalRedemptions, tierDistribution] = await Promise.all([
    InvestmentTransaction.sum('investmentPoints').catch(() => 0),
    InvestmentTransaction.sum('loyaltyPoints').catch(() => 0),
    RewardRedemption.count().catch(() => 0),
    User.findAll({
      attributes: ['investmentTier', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { role: 'customer' },
      group: ['investmentTier'],
      raw: true,
    }).catch(() => []),
  ]);

  return {
    totalInvestmentPointsIssued: totalIp || 0,
    totalLoyaltyPointsBalance: totalLp || 0,
    totalRedemptionsCount: totalRedemptions || 0,
    tierDistribution,
  };
};

module.exports = {
  evaluateInvestmentTier,
  getInvestmentTierProgress,
  awardPurchaseInvestment,
  awardEngagementBonus,
  redeemLoyaltyPoints,
  getUserInvestmentSummary,
  getInvestmentTransactionsHistory,
  adjustUserInvestmentPoints,
  getAdminInvestmentAnalytics,
  BRAND_TIERS_DEFAULT,
};
