import { getCustomerToken, getAdminToken } from './authHelper';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

const getCustomerHeaders = () => {
  const token = getCustomerToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const getAdminHeaders = () => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res, defaultMsg) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || defaultMsg);
    err.status = res.status;
    throw err;
  }
  return data;
};

// ─── USER LOYALTY API ─────────────────────────────────────────────────────────

export const getMyLoyalty = async () => {
  if (!getCustomerToken()) return null;
  const res = await fetch(`${API}/loyalty/me`, { headers: getCustomerHeaders() });
  return handleResponse(res, 'Failed to fetch loyalty balance');
};

export const getMyHistory = async ({ page = 1, limit = 20 } = {}) => {
  if (!getCustomerToken()) return { transactions: [], total: 0 };
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${API}/loyalty/me/history?${params}`, { headers: getCustomerHeaders() });
  return handleResponse(res, 'Failed to fetch transaction history');
};

export const askLoyaltyAI = async (query) => {
  const res = await fetch(`${API}/loyalty/ai/ask`, {
    method: 'POST',
    headers: getCustomerHeaders(),
    body: JSON.stringify({ query }),
  });
  return handleResponse(res, 'Failed to get answer from AI assistant');
};

// ─── ADMIN LOYALTY API ────────────────────────────────────────────────────────

export const getAdminLoyaltyStats = async () => {
  const res = await fetch(`${API}/loyalty/admin/stats`, { headers: getAdminHeaders() });
  return handleResponse(res, 'Failed to fetch loyalty stats');
};

export const getAdminLoyaltyUsers = async ({ search = '', tier = '', page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  if (tier) params.set('tier', tier);
  const res = await fetch(`${API}/loyalty/admin/users?${params}`, { headers: getAdminHeaders() });
  return handleResponse(res, 'Failed to fetch loyalty users');
};

export const getAdminUserLoyalty = async (userId) => {
  const res = await fetch(`${API}/loyalty/admin/users/${userId}`, { headers: getAdminHeaders() });
  return handleResponse(res, 'Failed to fetch user loyalty profile');
};

export const adjustUserPoints = async (userId, points, reason) => {
  const res = await fetch(`${API}/loyalty/admin/users/${userId}/adjust`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ points, reason }),
  });
  return handleResponse(res, 'Failed to adjust points');
};

export const getFlaggedAccounts = async ({ restriction = '', page = 1 } = {}) => {
  const params = new URLSearchParams({ page: String(page) });
  if (restriction) params.set('restriction', restriction);
  const res = await fetch(`${API}/loyalty/admin/flagged?${params}`, { headers: getAdminHeaders() });
  return handleResponse(res, 'Failed to fetch flagged accounts');
};

export const applyAccountRestriction = async (userId, level, note = '') => {
  const res = await fetch(`${API}/loyalty/admin/flagged/${userId}/restrict`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ level, note }),
  });
  return handleResponse(res, 'Failed to update restriction');
};

export const removeAccountRestriction = async (userId) => {
  const res = await fetch(`${API}/loyalty/admin/flagged/${userId}/restrict`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });
  return handleResponse(res, 'Failed to remove restriction');
};

export const getAILoyaltySummary = async () => {
  const res = await fetch(`${API}/loyalty/admin/ai/summarize`, {
    method: 'POST',
    headers: getAdminHeaders(),
  });
  return handleResponse(res, 'Failed to generate AI summary');
};

export const getAITriageUser = async (userId) => {
  const res = await fetch(`${API}/loyalty/admin/ai/triage/${userId}`, {
    method: 'POST',
    headers: getAdminHeaders(),
  });
  return handleResponse(res, 'Failed to generate AI triage');
};

export const getAdminTiers = async () => {
  const res = await fetch(`${API}/loyalty/admin/tiers`, { headers: getAdminHeaders() });
  return handleResponse(res, 'Failed to fetch tier configurations');
};

export const updateAdminTier = async (tierId, tierData) => {
  const res = await fetch(`${API}/loyalty/admin/tiers/${tierId}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(tierData),
  });
  return handleResponse(res, 'Failed to update tier');
};

export const getAdminLoyaltySettings = async () => {
  const res = await fetch(`${API}/loyalty/admin/settings`, { headers: getAdminHeaders() });
  return handleResponse(res, 'Failed to fetch loyalty settings');
};

export const updateAdminLoyaltySettings = async (settingsData) => {
  const res = await fetch(`${API}/loyalty/admin/settings`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(settingsData),
  });
  return handleResponse(res, 'Failed to update loyalty settings');
};

// ─── BRAND INVESTMENT API ─────────────────────────────────────────────────────

export const getMyInvestmentSummary = async () => {
  if (!getCustomerToken()) return null;
  const res = await fetch(`${API}/loyalty/investment/summary`, { headers: getCustomerHeaders() });
  return handleResponse(res, 'Failed to fetch investment summary');
};

export const getMyInvestmentHistory = async ({ page = 1, limit = 20 } = {}) => {
  if (!getCustomerToken()) return { transactions: [], total: 0 };
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${API}/loyalty/investment/history?${params}`, { headers: getCustomerHeaders() });
  return handleResponse(res, 'Failed to fetch investment transactions');
};

export const engageActivity = async (activityType, referenceId = null) => {
  const res = await fetch(`${API}/loyalty/investment/engage`, {
    method: 'POST',
    headers: getCustomerHeaders(),
    body: JSON.stringify({ activityType, referenceId }),
  });
  return handleResponse(res, 'Failed to record engagement activity');
};

export const redeemPoints = async ({ rewardTitle, rewardType, lpCost }) => {
  const res = await fetch(`${API}/loyalty/investment/redeem`, {
    method: 'POST',
    headers: getCustomerHeaders(),
    body: JSON.stringify({ rewardTitle, rewardType, lpCost }),
  });
  return handleResponse(res, 'Failed to redeem loyalty points');
};

export const calculateOrderImpact = async (cartSubtotal, campaignId = null) => {
  const res = await fetch(`${API}/loyalty/investment/calculate-order`, {
    method: 'POST',
    headers: getCustomerHeaders(),
    body: JSON.stringify({ cartSubtotal, campaignId }),
  });
  return handleResponse(res, 'Failed to calculate order investment impact');
};

export const getAdminInvestmentAnalytics = async () => {
  const res = await fetch(`${API}/loyalty/admin/investment-analytics`, { headers: getAdminHeaders() });
  return handleResponse(res, 'Failed to fetch investment analytics');
};

export const adjustUserInvestmentPoints = async ({ userId, ipAmount, lpAmount, reason }) => {
  const res = await fetch(`${API}/loyalty/admin/adjust-investment`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ userId, ipAmount, lpAmount, reason }),
  });
  return handleResponse(res, 'Failed to adjust investment points');
};
