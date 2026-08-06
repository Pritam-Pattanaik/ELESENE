const express = require('express');
const router = express.Router();
const { protect, optionalProtect, admin, superAdmin } = require('../middleware/auth.middleware');
const {
  // User
  getMyLoyalty,
  getMyHistory,
  askLoyaltyAI,
  getMyInvestmentSummary,
  getMyInvestmentHistory,
  engageActivity,
  redeemPoints,
  calculateOrderImpact,
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
  getAdminInvestmentAnalytics,
  adjustUserInvestmentPoints,
  // Super-admin
  getTiers,
  updateTier,
  getSettings,
  updateSettings,
} = require('../controllers/loyalty.controller');

// ─── User routes ─────────────────────────────────────────────────────────────
router.get('/me',            protect, getMyLoyalty);
router.get('/me/history',    protect, getMyHistory);
router.post('/ai/ask',       protect, askLoyaltyAI);

// ─── Brand Investment Program User Routes ───────────────────────────────────────
router.get('/investment/summary',         protect, getMyInvestmentSummary);
router.get('/investment/history',         protect, getMyInvestmentHistory);
router.post('/investment/engage',         protect, engageActivity);
router.post('/investment/redeem',         protect, redeemPoints);
router.post('/investment/calculate-order', optionalProtect, calculateOrderImpact);

// ─── Admin routes (admin + superadmin) ────────────────────────────────────────
router.get('/admin/stats',              protect, admin, getAdminStats);
router.get('/admin/users',              protect, admin, getAdminLoyaltyUsers);
router.get('/admin/users/:id',          protect, admin, getAdminUserLoyalty);
router.post('/admin/users/:id/adjust',  protect, admin, adjustUserPoints);
router.get('/admin/flagged',            protect, admin, getFlaggedAccounts);
router.post('/admin/flagged/:userId/restrict',   protect, admin, applyRestriction);
router.delete('/admin/flagged/:userId/restrict', protect, admin, removeRestriction);
router.post('/admin/ai/summarize',      protect, admin, aiSummarize);
router.post('/admin/ai/triage/:userId', protect, admin, aiTriageUser);
router.get('/admin/investment-analytics', protect, admin, getAdminInvestmentAnalytics);
router.post('/admin/adjust-investment',   protect, admin, adjustUserInvestmentPoints);

// ─── Super-admin only ─────────────────────────────────────────────────────────
router.get('/admin/tiers',      protect, superAdmin, getTiers);
router.put('/admin/tiers/:id',  protect, superAdmin, updateTier);
router.get('/admin/settings',   protect, superAdmin, getSettings);
router.put('/admin/settings',   protect, superAdmin, updateSettings);

module.exports = router;
