import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyLoyalty, getMyHistory, askLoyaltyAI } from '../../api/loyalty';
import { Sparkles, Trophy, Award, Gift, Clock, ArrowUpRight, ArrowDownLeft, RefreshCw, Send, ShieldCheck, ChevronRight } from 'lucide-react';

const LoyaltyPage = () => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalTxns, setTotalTxns] = useState(0);

  // AI assistant chat state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Greetings! I am your ELESENE Concierge. Ask me anything about your points, tier status, or brand perks.',
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loyaltyRes, historyRes] = await Promise.all([
        getMyLoyalty(),
        getMyHistory({ page: 1, limit: 10 }),
      ]);
      setData(loyaltyRes);
      if (historyRes?.transactions) {
        setHistory(historyRes.transactions);
        setTotalTxns(historyRes.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;

    const userText = aiQuery.trim();
    setAiQuery('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAiLoading(true);

    try {
      const res = await askLoyaltyAI(userText);
      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: res.answer || 'I could not retrieve an answer at this time.' },
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: `Sorry, ${err.message || 'something went wrong.'}` },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#c5a85c]" />
        <span>Loading your ELESENE loyalty privileges...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-xl text-red-300 text-center my-6">
        <p className="font-medium">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-xs font-semibold uppercase tracking-wider text-white transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const balance = data?.balance || 0;
  const currentTier = data?.currentTier || 'Member';
  const nextTier = data?.nextTier;
  const progressPct = data?.progressPct || 0;
  const pointsToNext = data?.pointsToNext || 0;
  const perks = data?.perks || {};
  const allTiers = data?.allTiers || [];

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* ─── Hero Card: Luxury Liquid Glass Balance Card ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#c5a85c]/30 bg-gradient-to-br from-[#1c1924] via-[#14121a] to-[#0e0d14] p-8 shadow-2xl"
      >
        {/* Ambient Specular Highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c5a85c]/50 to-transparent" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#c5a85c]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#c5a85c] text-xs font-semibold tracking-widest uppercase mb-2">
              <Trophy className="w-4 h-4" /> ELESENE Privilege Club
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-100 tracking-tight">
              {currentTier} Tier
            </h1>
            <p className="text-stone-400 text-sm mt-1 max-w-md">
              Earn 1 point for every ₹100 spent. Higher tiers unlock exclusive early access, custom privileges, and private brand invites.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center min-w-[200px] backdrop-blur-md shadow-inner">
            <span className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Available Points</span>
            <span className="text-4xl font-extrabold text-[#c5a85c] tracking-tight">{balance.toLocaleString()}</span>
            <span className="text-[10px] text-stone-500 block mt-1">PTS</span>
          </div>
        </div>

        {/* Tier Progress Bar */}
        {nextTier && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-stone-300 font-medium flex items-center gap-1.5">
                Progress to <span className="text-[#c5a85c] font-bold">{nextTier}</span>
              </span>
              <span className="text-stone-400">{pointsToNext} pts needed</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#c5a85c] to-[#e8c96a] rounded-full shadow-[0_0_10px_rgba(197,168,92,0.5)]"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Tiers & Perks Overview ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-200 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#c5a85c]" /> Privilege Tiers & Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allTiers.map((tier) => {
            const isCurrent = tier.name === currentTier;
            return (
              <div
                key={tier.id}
                className={`relative rounded-xl p-6 border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-[#1e1b29] border-[#c5a85c] shadow-[0_0_20px_rgba(197,168,92,0.15)]'
                    : 'bg-[#131219]/60 border-white/10 hover:border-white/20'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 bg-[#c5a85c] text-stone-950 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
                <h3 className="text-lg font-serif font-bold text-stone-100">{tier.name}</h3>
                <p className="text-xs text-stone-400 mt-0.5 mb-4">
                  {tier.max_points ? `${tier.min_points} – ${tier.max_points} pts` : `${tier.min_points}+ pts`}
                </p>
                <ul className="space-y-2 text-xs text-stone-300">
                  {tier.perks.birthday_discount_pct && (
                    <li className="flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-[#c5a85c]" />
                      <span>{tier.perks.birthday_discount_pct}% Birthday Special Discount</span>
                    </li>
                  )}
                  {tier.perks.early_access_hours > 0 && (
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#c5a85c]" />
                      <span>{tier.perks.early_access_hours}h Early Drop Access</span>
                    </li>
                  )}
                  {tier.perks.free_shipping && (
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c5a85c]" />
                      <span>Complimentary Shipping</span>
                    </li>
                  )}
                  {tier.perks.invite_events && (
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#c5a85c]" />
                      <span>Private VIP Invitations</span>
                    </li>
                  )}
                  {tier.perks.priority_support && (
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c5a85c]" />
                      <span>Priority Concierge Support</span>
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Grok AI Natural Language Assistant ──────────────────────────────── */}
      <div className="rounded-xl border border-[#c5a85c]/30 bg-[#161420] p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#c5a85c]/10 text-[#c5a85c]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-100">AI Brand Concierge</h2>
            <p className="text-xs text-stone-400">Powered by Grok AI — Ask questions about your points, status, or privileges</p>
          </div>
        </div>

        <div className="bg-[#0e0d14] border border-white/10 rounded-lg p-4 h-56 overflow-y-auto space-y-3 text-xs mb-4 scrollbar-thin">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#c5a85c] text-stone-950 font-medium'
                    : 'bg-white/10 text-stone-200 border border-white/10'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-stone-400 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5a85c]" />
                <span>Consulting AI Concierge...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g. How many more points do I need for Founder tier?"
            className="flex-1 bg-[#0e0d14] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-[#c5a85c] placeholder-stone-500"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="px-5 py-2.5 bg-[#c5a85c] hover:bg-[#ddb95c] disabled:opacity-50 text-stone-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* ─── Transaction History ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/10 bg-[#14131c] overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#c5a85c]" /> Activity & Points History
          </h2>
          <span className="text-xs text-stone-400">{totalTxns} total entries</span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">No points transactions recorded yet. Complete an order to earn points!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/10 text-stone-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right">Points</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {history.map((txn) => {
                  const isEarn = txn.points > 0;
                  return (
                    <tr key={txn.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4 text-stone-400">
                        {new Date(txn.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                            txn.type === 'earn'
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20'
                              : txn.type === 'reversal'
                              ? 'bg-rose-950/50 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-950/50 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isEarn ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-stone-300">{txn.reason || '—'}</td>
                      <td className={`py-3 px-4 text-right font-bold ${isEarn ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isEarn ? `+${txn.points}` : txn.points}
                      </td>
                      <td className="py-3 px-4 text-right text-stone-400 font-mono">{txn.balance_after}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPage;
