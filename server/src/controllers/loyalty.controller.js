/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — LOYALTY CONTROLLER
 * ══════════════════════════════════════════════════════════════════════════════
 */

const { Op } = require('sequelize');
const sequelize = require('../config/db');
const {
  User,
  LoyaltyTransaction,
  LoyaltyReturnStat,
  LoyaltyTier,
  LoyaltySettings,
} = require('../models');
const loyaltyService = require('../services/loyalty.service');
const grokService    = require('../services/grok.service');

// ═══════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════

// @desc  Get current user's loyalty balance, tier, and progress
// @route GET /api/loyalty/me
// @auth  protect
const getMyLoyalty = async (req, res) => {
  try {
    const data = await loyaltyService.getBalance(req.user.id);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get paginated transaction history for current user
// @route GET /api/loyalty/me/history?page=1&limit=20
// @auth  protect
const getMyHistory = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const data = await loyaltyService.getHistory(req.user.id, page, limit);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Ask the AI loyalty assistant a question
// @route POST /api/loyalty/ai/ask
// @auth  protect
// @body  { query: string }
const askLoyaltyAI = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'query is required' });
    }

    const loyalty = await loyaltyService.getBalance(req.user.id);
    const answer = await grokService.getUserAssistant(req.user.id, loyalty, query.trim());

    res.json({ success: true, answer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════

// @desc  Get loyalty program dashboard stats
// @route GET /api/loyalty/admin/stats
// @auth  protect + admin
const getAdminStats = async (req, res) => {
  try {
    const stats = await loyaltyService.getProgramStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Search/list users with loyalty + return-rate data
// @route GET /api/loyalty/admin/users?search=&tier=&page=1&limit=20
// @auth  protect + admin
const getAdminLoyaltyUsers = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { search, tier } = req.query;

    const where = { role: 'customer' };
    if (tier) where.loyalty_tier = tier;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email:     { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'full_name', 'email', 'loyalty_points', 'loyalty_tier', 'created_at'],
      include: [{ model: LoyaltyReturnStat, as: 'returnStat', required: false }],
      order: [['loyalty_points', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, total: count, page, limit, users: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get full loyalty profile of one user
// @route GET /api/loyalty/admin/users/:id
// @auth  protect + admin
const getAdminUserLoyalty = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'full_name', 'email', 'loyalty_points', 'loyalty_tier'],
      include: [{ model: LoyaltyReturnStat, as: 'returnStat', required: false }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const tierProgress = await loyaltyService.getTierProgress(user.loyalty_points);
    const history = await loyaltyService.getHistory(user.id, 1, 20);

    res.json({ success: true, user, ...tierProgress, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Manually adjust a user's points (customer service)
// @route POST /api/loyalty/admin/users/:id/adjust
// @auth  protect + admin
// @body  { points: number, reason: string }
const adjustUserPoints = async (req, res) => {
  try {
    const { points, reason } = req.body;
    if (points === undefined || !reason?.trim()) {
      return res.status(400).json({ success: false, message: 'points and reason are required' });
    }
    const result = await loyaltyService.adjustPoints(
      req.params.id,
      parseInt(points),
      reason.trim(),
      req.user.id
    );
    res.json({ success: true, ...result, message: 'Points adjusted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  List flagged accounts (sorted by return rate DESC)
// @route GET /api/loyalty/admin/flagged?restriction=&page=1
// @auth  protect + admin
const getFlaggedAccounts = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const where = { is_flagged: true };
    if (req.query.restriction) where.restriction_level = req.query.restriction;

    const { count, rows } = await LoyaltyReturnStat.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'full_name', 'email', 'loyalty_tier', 'loyalty_points'],
      }],
      order: [['return_rate', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, total: count, page, limit, accounts: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Apply / update restriction on a flagged account
// @route POST /api/loyalty/admin/flagged/:userId/restrict
// @auth  protect + admin
// @body  { level: 'soft'|'medium'|'hard', note: string }
const applyRestriction = async (req, res) => {
  try {
    const { level, note } = req.body;
    const validLevels = ['none', 'soft', 'medium', 'hard'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ success: false, message: `level must be one of: ${validLevels.join(', ')}` });
    }

    const stat = await LoyaltyReturnStat.findOne({ where: { user_id: req.params.userId } });
    if (!stat) return res.status(404).json({ success: false, message: 'No return stat found for this user' });

    await stat.update({
      restriction_level: level,
      restriction_note: note || null,
      restriction_set_by: req.user.id,
      restriction_set_at: new Date(),
    });

    res.json({ success: true, stat, message: `Restriction set to '${level}'` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Remove restriction + un-flag an account
// @route DELETE /api/loyalty/admin/flagged/:userId/restrict
// @auth  protect + admin
const removeRestriction = async (req, res) => {
  try {
    const stat = await LoyaltyReturnStat.findOne({ where: { user_id: req.params.userId } });
    if (!stat) return res.status(404).json({ success: false, message: 'Not found' });

    await stat.update({
      is_flagged: false,
      flag_reason: null,
      flagged_at: null,
      restriction_level: 'none',
      restriction_note: null,
      restriction_set_by: req.user.id,
      restriction_set_at: new Date(),
    });

    res.json({ success: true, message: 'Restriction removed and flag cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  AI: summarize loyalty program performance for admin
// @route POST /api/loyalty/admin/ai/summarize
// @auth  protect + admin
const aiSummarize = async (req, res) => {
  try {
    const stats = await loyaltyService.getProgramStats();
    const summary = await grokService.getLoyaltySummary(stats);
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  AI: triage a specific flagged account
// @route POST /api/loyalty/admin/ai/triage/:userId
// @auth  protect + admin
const aiTriageUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: ['id', 'full_name', 'email', 'loyalty_tier', 'loyalty_points'],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const stat = await LoyaltyReturnStat.findOne({ where: { user_id: req.params.userId } });
    if (!stat) return res.status(404).json({ success: false, message: 'No return stats for this user' });

    const { transactions } = await loyaltyService.getHistory(req.params.userId, 1, 10);
    const analysis = await grokService.triageFlaggedAccount(user, stat, transactions);

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════
// SUPER-ADMIN: Tiers + Settings
// ═══════════════════════════════════════

// @desc  Get all tier configs
// @route GET /api/loyalty/admin/tiers
// @auth  protect + superAdmin
const getTiers = async (req, res) => {
  try {
    const tiers = await LoyaltyTier.findAll({ order: [['sort_order', 'ASC']] });
    res.json({ success: true, tiers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update a tier's thresholds or perks
// @route PUT /api/loyalty/admin/tiers/:id
// @auth  protect + superAdmin
// @body  { min_points, max_points, name, perks, is_active }
const updateTier = async (req, res) => {
  try {
    const tier = await LoyaltyTier.findByPk(req.params.id);
    if (!tier) return res.status(404).json({ success: false, message: 'Tier not found' });

    const { name, min_points, max_points, perks, sort_order, is_active } = req.body;
    await tier.update({ name, min_points, max_points, perks, sort_order, is_active });

    res.json({ success: true, tier, message: 'Tier updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get loyalty program settings
// @route GET /api/loyalty/admin/settings
// @auth  protect + superAdmin
const getSettings = async (req, res) => {
  try {
    const settings = await loyaltyService.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update loyalty program settings
// @route PUT /api/loyalty/admin/settings
// @auth  protect + superAdmin
// @body  { points_per_100_inr, return_flag_threshold_pct, return_flag_min_orders }
const updateSettings = async (req, res) => {
  try {
    let settings = await LoyaltySettings.findByPk(1);
    if (!settings) {
      settings = await LoyaltySettings.create({ id: 1 });
    }
    const { points_per_100_inr, return_flag_threshold_pct, return_flag_min_orders } = req.body;
    await settings.update({
      ...(points_per_100_inr       !== undefined && { points_per_100_inr }),
      ...(return_flag_threshold_pct !== undefined && { return_flag_threshold_pct }),
      ...(return_flag_min_orders    !== undefined && { return_flag_min_orders }),
      updated_by: req.user.id,
    });
    res.json({ success: true, settings, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  // User
  getMyLoyalty,
  getMyHistory,
  askLoyaltyAI,
  // Admin
  getAdminStats,
  getAdminLoyaltyUsers,
  getAdminUserLoyalty,
  adjustUserPoints,
  getFlaggedAccounts,
  applyRestriction,
  removeRestriction,
  aiSummarize,
  aiTriageUser,
  // Super-admin
  getTiers,
  updateTier,
  getSettings,
  updateSettings,
};
