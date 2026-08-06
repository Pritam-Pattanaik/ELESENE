import { useState, useEffect } from 'react';
import {
  getAdminLoyaltyStats,
  getAdminLoyaltyUsers,
  getAdminUserLoyalty,
  adjustUserPoints,
  getAILoyaltySummary,
} from '../../api/loyalty';
import { Sparkles, Trophy, Users, AlertTriangle, RefreshCw, Search, Filter, Sliders, ArrowUpRight, ArrowDownLeft, ShieldAlert } from 'lucide-react';

const LoyaltyManagement = () => {
  const [stats, setStats] = useState(null);
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
  const [adjustPointsVal, setAdjustPointsVal] = useState('');
  const [adjustReasonVal, setAdjustReasonVal] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState('');

  // AI Summary
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        getAdminLoyaltyStats(),
        getAdminLoyaltyUsers({ search, tier: tierFilter, page, limit: 15 }),
      ]);
      if (statsRes?.stats) setStats(statsRes.stats);
      if (usersRes?.users) {
        setUsers(usersRes.users);
        setTotalUsers(usersRes.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load loyalty management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, tierFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleOpenUserModal = async (user) => {
    setSelectedUser(user);
    setModalLoading(true);
    setAdjustSuccess('');
    setAdjustPointsVal('');
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

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    if (!adjustPointsVal || !adjustReasonVal.trim()) return;

    setAdjustSubmitting(true);
    setAdjustSuccess('');
    try {
      const pts = parseInt(adjustPointsVal);
      await adjustUserPoints(selectedUser.id, pts, adjustReasonVal.trim());
      setAdjustSuccess(`Successfully adjusted points by ${pts > 0 ? '+' : ''}${pts}`);
      setAdjustPointsVal('');
      setAdjustReasonVal('');
      // Refresh modal user profile & main table
      const res = await getAdminUserLoyalty(selectedUser.id);
      setUserProfile(res);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to adjust points');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const handleGenerateAISummary = async () => {
    setAiLoading(true);
    try {
      const res = await getAILoyaltySummary();
      setAiSummary(res.summary || 'No summary generated');
    } catch (err) {
      setAiSummary(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="admin-content space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f0ece2] flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#c8a84b]" /> Loyalty Score Management
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Monitor customer tier distribution, manage points, perform manual adjustments, and run Grok AI analytics.
          </p>
        </div>

        <button
          onClick={handleGenerateAISummary}
          disabled={aiLoading}
          className="admin-btn admin-btn-primary flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{aiLoading ? 'Generating AI Digest...' : 'Grok AI Performance Digest'}</span>
        </button>
      </div>

      {/* ─── AI Summary Banner ──────────────────────────────────────────────── */}
      {aiSummary && (
        <div className="admin-card p-5 border-[#c8a84b]/40 bg-gradient-to-r from-[#1c1826] via-[#14121c] to-[#1a1724]">
          <div className="flex items-center gap-2 text-[#c8a84b] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> Grok AI Executive Summary
          </div>
          <div className="text-xs text-stone-300 leading-relaxed whitespace-pre-line">
            {aiSummary}
          </div>
        </div>
      )}

      {/* ─── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Points Issued</div>
          <div className="admin-stat-value text-emerald-400">
            {(stats?.totalPointsIssued || 0).toLocaleString()}
          </div>
          <div className="admin-stat-sub">Lifetime rewards earned</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Points Reversed (Returns)</div>
          <div className="admin-stat-value text-rose-400">
            {(stats?.totalPointsReversed || 0).toLocaleString()}
          </div>
          <div className="admin-stat-sub">Order refund clawbacks</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Net Outstanding Points</div>
          <div className="admin-stat-value text-[#c8a84b]">
            {(stats?.netPointsOutstanding || 0).toLocaleString()}
          </div>
          <div className="admin-stat-sub">Active unspent balances</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Flagged Accounts</div>
          <div className="admin-stat-value text-amber-400">
            {stats?.flaggedAccounts || 0}
          </div>
          <div className="admin-stat-sub">High return rate or shortfall</div>
        </div>
      </div>

      {/* ─── Toolbar: Search & Filters ──────────────────────────────────────── */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-search flex-1">
          <Search />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="admin-filters">
          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setPage(1);
            }}
            className="admin-filter-select"
          >
            <option value="">All Tiers</option>
            <option value="Member">Member</option>
            <option value="Insider">Insider</option>
            <option value="Founder">Founder</option>
          </select>
        </div>
      </div>

      {/* ─── Customer Loyalty Table ─────────────────────────────────────────── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Customer Loyalty Roster</h3>
          <span className="text-xs text-stone-400">{totalUsers} customers</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Tier</th>
                <th>Points Balance</th>
                <th>Total Orders</th>
                <th>Return Rate</th>
                <th>Flag Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="admin-loading">
                      <div className="admin-spinner" />
                      <span>Loading loyalty database...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-stone-500">
                    No customers match the current filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const stat = user.returnStat || {};
                  const isFlagged = stat.is_flagged;
                  const rate = Number(stat.return_rate || 0).toFixed(1);

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="font-medium text-stone-100">{user.full_name || 'Customer'}</div>
                        <div className="text-xs text-stone-500">{user.email}</div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-gold">{user.loyalty_tier || 'Member'}</span>
                      </td>
                      <td className="primary-cell font-mono">{user.loyalty_points?.toLocaleString() || 0} pts</td>
                      <td>{stat.total_orders || 0}</td>
                      <td>
                        <span className={`font-semibold ${Number(rate) > 40 ? 'text-rose-400' : 'text-stone-300'}`}>
                          {rate}%
                        </span>
                      </td>
                      <td>
                        {isFlagged ? (
                          <span className="admin-badge admin-badge-red flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Flagged
                          </span>
                        ) : (
                          <span className="admin-badge admin-badge-green">Clear</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleOpenUserModal(user)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          Manage & Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── User Detail & Points Adjustment Modal ──────────────────────────── */}
      {selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-lg">
            <div className="admin-modal-header">
              <h3>Loyalty Profile: {selectedUser.full_name || selectedUser.email}</h3>
              <button onClick={() => setSelectedUser(null)} className="admin-btn-icon">
                ✕
              </button>
            </div>

            <div className="admin-modal-body space-y-6">
              {modalLoading ? (
                <div className="admin-loading py-12">
                  <div className="admin-spinner" />
                  <span>Loading user audit trail...</span>
                </div>
              ) : (
                <>
                  {/* Balance Header Summary */}
                  <div className="grid grid-cols-3 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/10 text-center">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400">Current Balance</span>
                      <p className="text-xl font-bold text-[#c8a84b] mt-1">{userProfile?.user?.loyalty_points || 0} pts</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-stone-400">Active Tier</span>
                      <p className="text-xl font-bold text-stone-100 mt-1">{userProfile?.user?.loyalty_tier || 'Member'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-stone-400">Return Rate</span>
                      <p className={`text-xl font-bold mt-1 ${Number(userProfile?.returnStat?.return_rate || 0) > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {Number(userProfile?.returnStat?.return_rate || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Manual Points Adjustment Form */}
                  <div className="p-4 rounded-xl border border-[#c8a84b]/30 bg-[#161422]">
                    <h4 className="text-xs font-bold text-[#c8a84b] uppercase tracking-wider mb-3">
                      Manual Customer Service Adjustment
                    </h4>

                    {adjustSuccess && (
                      <div className="mb-3 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded border border-emerald-500/20">
                        {adjustSuccess}
                      </div>
                    )}

                    <form onSubmit={handleAdjustPoints} className="space-y-3">
                      <div className="admin-form-row">
                        <div>
                          <label className="admin-label">Points Adjustment (+ / -)</label>
                          <input
                            type="number"
                            placeholder="e.g. 200 or -50"
                            value={adjustPointsVal}
                            onChange={(e) => setAdjustPointsVal(e.target.value)}
                            className="admin-input"
                            required
                          />
                        </div>
                        <div>
                          <label className="admin-label">Audit Reason (Required)</label>
                          <input
                            type="text"
                            placeholder="e.g. CS goodwill compensation"
                            value={adjustReasonVal}
                            onChange={(e) => setAdjustReasonVal(e.target.value)}
                            className="admin-input"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={adjustSubmitting}
                        className="admin-btn admin-btn-primary admin-btn-sm"
                      >
                        {adjustSubmitting ? 'Applying Adjustment...' : 'Apply Points Adjustment'}
                      </button>
                    </form>
                  </div>

                  {/* Transaction History Log */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                      Recent Audit History
                    </h4>
                    <div className="max-h-48 overflow-y-auto border border-white/10 rounded-lg">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Points</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userProfile?.history?.transactions?.map((t) => (
                            <tr key={t.id}>
                              <td className="text-stone-400">{new Date(t.created_at).toLocaleDateString()}</td>
                              <td className="uppercase font-semibold text-[10px]">{t.type}</td>
                              <td className={t.points > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {t.points > 0 ? `+${t.points}` : t.points}
                              </td>
                              <td className="text-stone-300">{t.reason || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="admin-modal-footer">
              <button onClick={() => setSelectedUser(null)} className="admin-btn admin-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyManagement;
