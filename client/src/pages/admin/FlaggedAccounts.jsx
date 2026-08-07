import { useState, useEffect, useCallback } from 'react';
import {
  getFlaggedAccounts,
  applyAccountRestriction,
  removeAccountRestriction,
  getAITriageUser,
} from '../../api/loyalty';
import { ShieldAlert, Sparkles, ShieldOff, Info } from 'lucide-react';

const FlaggedAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [restrictionFilter, setRestrictionFilter] = useState('');
  const [page, setPage] = useState(1);

  // Action modals
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [restrictionLevel, setRestrictionLevel] = useState('soft');
  const [restrictionNote, setRestrictionNote] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Grok AI Triage
  const [aiTriageModal, setAiTriageModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await getFlaggedAccounts({ restriction: restrictionFilter, page });
      if (res?.accounts) {
        setAccounts(res.accounts);
        setTotalAccounts(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load flagged accounts');
    } finally {
      setLoading(false);
    }
  }, [page, restrictionFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(false), 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleApplyRestriction = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setActionSubmitting(true);
    try {
      await applyAccountRestriction(selectedAccount.user_id, restrictionLevel, restrictionNote);
      setSelectedAccount(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to set restriction');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleRemoveRestriction = async (userId) => {
    if (!window.confirm('Are you sure you want to clear this flag and restore normal status?')) return;

    try {
      await removeAccountRestriction(userId);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to clear flag');
    }
  };

  const handleRunAITriage = async (account) => {
    setSelectedAccount(account);
    setAiTriageModal(true);
    setAiAnalysis('');
    setAiLoading(true);

    try {
      const res = await getAITriageUser(account.user_id);
      setAiAnalysis(res.analysis || 'No analysis produced');
    } catch (err) {
      setAiAnalysis(`Error running AI triage: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="admin-content space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f0ece2] flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" /> Return Abuse & Flagged Accounts
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Review accounts flagged for high return rates (&gt;40%) or points shortfalls. All restrictions require explicit admin action.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="admin-filters">
          <select
            value={restrictionFilter}
            onChange={(e) => {
              setRestrictionFilter(e.target.value);
              setPage(1);
            }}
            className="admin-filter-select"
          >
            <option value="">All Restriction Levels</option>
            <option value="none">None (Flagged Only)</option>
            <option value="soft">Soft Restriction</option>
            <option value="medium">Medium Restriction</option>
            <option value="hard">Hard Tier Freeze</option>
          </select>
        </div>
      </div>

      {/* ─── Guidance Banner ────────────────────────────────────────────────── */}
      <div className="admin-card p-4 bg-amber-950/20 border-amber-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong>Fair Abuse Handling Policy:</strong> Accounts are flagged automatically when their weighted return rate exceeds the 40% threshold, but <strong>no penalties are ever applied automatically</strong>. Use the Grok AI Triage tool to evaluate whether returns stem from genuine sizing issues vs repetitive abuse before setting a soft, medium, or hard restriction.
        </div>
      </div>

      {/* ─── Flagged Accounts Table ─────────────────────────────────────────── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Flagged Account Queue</h3>
          <span className="text-xs text-stone-400">{totalAccounts} flagged user(s)</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Total Orders</th>
                <th>Returns (Raw / Weighted)</th>
                <th>Return Rate</th>
                <th>Flag Reason</th>
                <th>Current Restriction</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="admin-loading">
                      <div className="admin-spinner" />
                      <span>Loading flagged accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-stone-500">
                    No flagged accounts found. All customer accounts are healthy!
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const user = acc.User || {};
                  const rate = Number(acc.return_rate || 0).toFixed(1);

                  return (
                    <tr key={acc.id}>
                      <td>
                        <div className="font-medium text-stone-100">{user.full_name || 'Customer'}</div>
                        <div className="text-xs text-stone-500">{user.email}</div>
                      </td>
                      <td>{acc.total_orders}</td>
                      <td>
                        <span className="text-stone-200">{acc.total_returns}</span>
                        <span className="text-xs text-stone-500 ml-1">({acc.weighted_returns} weighted)</span>
                      </td>
                      <td>
                        <span className="font-bold text-rose-400">{rate}%</span>
                      </td>
                      <td className="max-w-xs truncate text-xs text-stone-300">
                        {acc.flag_reason || 'Return rate threshold exceeded'}
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            acc.restriction_level === 'hard'
                              ? 'admin-badge-red'
                              : acc.restriction_level === 'medium'
                              ? 'admin-badge-orange'
                              : acc.restriction_level === 'soft'
                              ? 'admin-badge-gold'
                              : 'admin-badge-gray'
                          }`}
                        >
                          {acc.restriction_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => handleRunAITriage(acc)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Run Grok AI Abuse Triage"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#c8a84b]" />
                          <span>AI Triage</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAccount(acc);
                            setRestrictionLevel(acc.restriction_level === 'none' ? 'soft' : acc.restriction_level);
                            setRestrictionNote(acc.restriction_note || '');
                          }}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                        >
                          Set Restriction
                        </button>

                        <button
                          onClick={() => handleRemoveRestriction(acc.user_id)}
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          title="Clear flag & restore normal status"
                        >
                          <ShieldOff className="w-3.5 h-3.5" />
                          <span>Clear Flag</span>
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

      {/* ─── Set Restriction Modal ──────────────────────────────────────────── */}
      {selectedAccount && !aiTriageModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Apply Restriction: {selectedAccount.User?.full_name || selectedAccount.User?.email}</h3>
              <button onClick={() => setSelectedAccount(null)} className="admin-btn-icon">
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyRestriction}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label">Restriction Level</label>
                  <select
                    value={restrictionLevel}
                    onChange={(e) => setRestrictionLevel(e.target.value)}
                    className="admin-select"
                  >
                    <option value="none">None — Clear restriction</option>
                    <option value="soft">Soft — Exclude from early access drops</option>
                    <option value="medium">Medium — Hold points earning & require order approval</option>
                    <option value="hard">Hard — Freeze tier status</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Admin Reason / Case Notes</label>
                  <textarea
                    value={restrictionNote}
                    onChange={(e) => setRestrictionNote(e.target.value)}
                    placeholder="Document case rationale (e.g. repeated returns of worn garments)..."
                    className="admin-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setSelectedAccount(null)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="admin-btn admin-btn-primary"
                >
                  {actionSubmitting ? 'Saving...' : 'Save Restriction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Grok AI Triage Modal ────────────────────────────────────────────── */}
      {aiTriageModal && selectedAccount && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-lg">
            <div className="admin-modal-header">
              <h3 className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c8a84b]" /> Grok AI Abuse Triage Analysis
              </h3>
              <button onClick={() => setAiTriageModal(false)} className="admin-btn-icon">
                ✕
              </button>
            </div>

            <div className="admin-modal-body space-y-4">
              <div className="bg-[#14121e] border border-white/10 p-4 rounded-xl text-xs space-y-1">
                <p><strong>Customer:</strong> {selectedAccount.User?.full_name} ({selectedAccount.User?.email})</p>
                <p><strong>Return Rate:</strong> {Number(selectedAccount.return_rate).toFixed(1)}% ({selectedAccount.total_returns} returns / {selectedAccount.total_orders} orders)</p>
              </div>

              {aiLoading ? (
                <div className="admin-loading py-12">
                  <div className="admin-spinner" />
                  <span>Consulting Grok AI to analyze return pattern...</span>
                </div>
              ) : (
                <div className="bg-[#0e0d14] border border-[#c8a84b]/30 p-5 rounded-xl text-xs text-stone-200 leading-relaxed whitespace-pre-line">
                  {aiAnalysis}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button onClick={() => setAiTriageModal(false)} className="admin-btn admin-btn-secondary">
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlaggedAccounts;
