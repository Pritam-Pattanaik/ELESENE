import { useState, useEffect, useCallback } from 'react';
import {
  getAdminLoyaltyStats,
  getAdminLoyaltyUsers,
  getAdminUserLoyalty,
  getAdminInvestmentAnalytics,
  adjustUserInvestmentPoints,
  getAILoyaltySummary,
} from '../../api/loyalty';
import { Sparkles, Trophy, RefreshCw, Search, Award, CheckCircle } from 'lucide-react';

const LoyaltyManagement = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(1);

  // User detail modal & adjustment
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [adjustIpVal, setAdjustIpVal] = useState('');
  const [adjustLpVal, setAdjustLpVal] = useState('');
  const [adjustReasonVal, setAdjustReasonVal] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState('');

  // AI Summary
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [statsRes, analyticsRes, usersRes] = await Promise.all([
        getAdminLoyaltyStats(),
        getAdminInvestmentAnalytics(),
        getAdminLoyaltyUsers({ search, tier: tierFilter, page, limit: 15 }),
      ]);
      if (statsRes?.stats) setStats(statsRes.stats);
      if (analyticsRes?.analytics) setAnalytics(analyticsRes.analytics);
      if (usersRes?.users) {
        setUsers(usersRes.users);
        setTotalUsers(usersRes.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load brand investment management data');
    } finally {
      setLoading(false);
    }
  }, [search, tierFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(false), 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleOpenUserModal = async (user) => {
    setSelectedUser(user);
    setModalLoading(true);
    setAdjustSuccess('');
    setAdjustIpVal('');
    setAdjustLpVal('');
    setAdjustReasonVal('');
    try {
      const res = await getAdminUserLoyalty(user.id);
      setUserProfile(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAdjustInvestment = async (e) => {
    e.preventDefault();
    if (!adjustReasonVal.trim()) return;

    setAdjustSubmitting(true);
    setAdjustSuccess('');
    try {
      await adjustUserInvestmentPoints({
        userId: selectedUser.id,
        ipAmount: parseInt(adjustIpVal || 0),
        lpAmount: parseInt(adjustLpVal || 0),
        reason: adjustReasonVal.trim(),
      });
      setAdjustSuccess('Investment & Loyalty points adjusted successfully with audit log.');
      setAdjustIpVal('');
      setAdjustLpVal('');
      setAdjustReasonVal('');
      const res = await getAdminUserLoyalty(selectedUser.id);
      setUserProfile(res);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to adjust investment points');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const handleGenerateAISummary = async () => {
    setAiLoading(true);
    try {
      const res = await getAILoyaltySummary();
      setAiSummary(res.summary || 'Summary generated');
    } catch (err) {
      setAiSummary(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span>Loading Brand Investment Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            Brand Investment Management Dashboard
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage customer lifetime standing, reward rules, manual point adjustments, and program analytics.
          </p>
        </div>

        <button
          onClick={handleGenerateAISummary}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-2 text-xs font-semibold text-black shadow-lg hover:brightness-110 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{aiLoading ? 'Analyzing...' : 'Generate AI Report'}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* AI Summary Box */}
      {aiSummary && (
        <div className="rounded-2xl border border-amber-500/30 bg-neutral-950 p-6 text-xs text-amber-200 leading-relaxed shadow-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI Executive Intelligence Summary
          </h3>
          <p>{aiSummary}</p>
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
          <span className="text-xs uppercase tracking-wider text-neutral-400">Total Investment Points Issued</span>
          <span className="text-3xl font-light tracking-tight text-amber-400 block mt-2 font-mono">
            {(analytics?.totalInvestmentPointsIssued || 0).toLocaleString()} IP
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 block">Lifetime Customer Contribution</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
          <span className="text-xs uppercase tracking-wider text-neutral-400">Spendable Loyalty Balance</span>
          <span className="text-3xl font-light tracking-tight text-emerald-400 block mt-2 font-mono">
            {(analytics?.totalLoyaltyPointsBalance || 0).toLocaleString()} LP
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 block">Outstanding Customer Rewards</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
          <span className="text-xs uppercase tracking-wider text-neutral-400">Total Reward Redemptions</span>
          <span className="text-3xl font-light tracking-tight text-purple-400 block mt-2 font-mono">
            {(analytics?.totalRedemptionsCount || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 block">Coupons & Privileges Claimed</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
          <span className="text-xs uppercase tracking-wider text-neutral-400">Flagged Risk Accounts</span>
          <span className="text-3xl font-light tracking-tight text-rose-400 block mt-2 font-mono">
            {stats?.flaggedAccounts || 0}
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 block">High Return Rate Watchlist</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-light text-white">Customer Investment Roster</h3>
            <span className="text-xs text-neutral-400">{totalUsers} total registered investors</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="rounded-xl border border-white/10 bg-neutral-950 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">All Tiers</option>
              <option value="Seed">Seed</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Diamond">Diamond</option>
            </select>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-white/10 uppercase tracking-wider text-neutral-400 font-semibold">
              <tr>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Investment Tier</th>
                <th className="py-3.5 px-6 text-right">Investment Points (IP)</th>
                <th className="py-3.5 px-6 text-right">Loyalty Points (LP)</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{user.full_name || 'Customer'}</div>
                    <div className="text-[11px] text-neutral-500">{user.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-950/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      <Award className="h-3 w-3" />
                      {user.investment_tier || user.loyalty_tier || 'Seed'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-medium text-amber-400">
                    {(user.investment_points || user.loyalty_points || 0).toLocaleString()} IP
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-medium text-emerald-400">
                    {(user.loyalty_points || 0).toLocaleString()} LP
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleOpenUserModal(user)}
                      className="rounded-lg bg-neutral-800 border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:border-amber-500/50"
                    >
                      Manage Standing
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-950 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-light text-white mb-2">Adjust Investment Standing</h3>
            <p className="text-xs text-neutral-400 mb-2">
              Customer: <strong className="text-white">{selectedUser.full_name}</strong> ({selectedUser.email})
            </p>

            {modalLoading ? (
              <p className="text-xs text-amber-400/80 mb-4 animate-pulse">Loading live account balance...</p>
            ) : userProfile ? (
              <div className="mb-4 flex gap-4 text-xs font-mono bg-neutral-900/60 p-2.5 rounded-xl border border-white/10">
                <span className="text-amber-400">Current IP: {(userProfile.investment_points || userProfile.loyalty_points || 0).toLocaleString()}</span>
                <span className="text-emerald-400">Current LP: {(userProfile.loyalty_points || 0).toLocaleString()}</span>
              </div>
            ) : null}

            {adjustSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-950/50 p-3 text-xs text-emerald-300 border border-emerald-800/40">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{adjustSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdjustInvestment} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Investment Points Adjustment (IP)</label>
                <input
                  type="number"
                  placeholder="+500 or -200"
                  value={adjustIpVal}
                  onChange={(e) => setAdjustIpVal(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Loyalty Points Adjustment (LP)</label>
                <input
                  type="number"
                  placeholder="+50 or -20"
                  value={adjustLpVal}
                  onChange={(e) => setAdjustLpVal(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Reason for Audit Log (Required)</label>
                <textarea
                  required
                  placeholder="Reason for manual point override..."
                  value={adjustReasonVal}
                  onChange={(e) => setAdjustReasonVal(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting || !adjustReasonVal.trim()}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {adjustSubmitting ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyManagement;
