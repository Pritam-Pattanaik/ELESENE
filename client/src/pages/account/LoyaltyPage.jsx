import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyInvestmentSummary, getMyInvestmentHistory, engageActivity, askLoyaltyAI } from '../../api/loyalty';
import InvestmentTierCard from '../../components/investment/InvestmentTierCard';
import InvestmentTimeline from '../../components/investment/InvestmentTimeline';
import RewardRedemptionModal from '../../components/investment/RewardRedemptionModal';
import InvestmentJourney from '../../components/investment/InvestmentJourney';
import { Sparkles, Trophy, Gift, RefreshCw, Send, Star, Share2, UserCheck } from 'lucide-react';

const LoyaltyPage = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [engaging, setEngaging] = useState(false);

  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Greetings! I am your ELESENE Investment Concierge. Ask me anything about your lifetime brand standing, tier perks, or reward redemptions.',
    },
  ]);

  const loadData = async (silent = false) => {
    if (!silent) { setLoading(true); setError(null); }
    try {
      const [sumRes, histRes] = await Promise.all([
        getMyInvestmentSummary(),
        getMyInvestmentHistory({ page: 1, limit: 15 }),
      ]);
      setSummary(sumRes);
      if (histRes?.transactions) setHistory(histRes.transactions);
    } catch (err) {
      if (!silent) setError(err.message || 'Failed to load brand investment summary');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') loadData(true);
    }, 15000);
    const handleFocus = () => loadData(true);
    window.addEventListener('focus', handleFocus);
    return () => { clearInterval(pollInterval); window.removeEventListener('focus', handleFocus); };
  }, []);

  const handleEngagementBonus = async (type) => {
    if (engaging) return;
    setEngaging(true);
    try {
      const res = await engageActivity(type);
      if (res.awarded) await loadData();
      else if (res.message) alert(res.message);
    } catch (err) {
      alert(err.message || 'Failed to record engagement activity');
    } finally {
      setEngaging(false);
    }
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;
    const userText = aiQuery.trim();
    setAiQuery('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setAiLoading(true);
    try {
      const res = await askLoyaltyAI(userText);
      setChatMessages((prev) => [...prev, { sender: 'bot', text: res.answer || 'I could not retrieve an answer at this time.' }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: `Sorry, ${err.message || 'something went wrong.'}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span className="text-sm font-futura tracking-wider">Retrieving your ELESENE Brand Investment privileges...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-rose-300 text-center my-6">
        <p className="font-medium">{error}</p>
        <button onClick={loadData} className="mt-3 px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 rounded-xl text-xs font-semibold uppercase tracking-wider text-white transition">
          Try Again
        </button>
      </div>
    );
  }

  const metrics = summary?.metrics || {};
  const progress = summary?.progress || {};

  const engagementActions = [
    { type: 'review',             label: 'Write Product Review', bonus: '+20 IP Bonus',  icon: <Star className="h-4 w-4" />,     color: 'amber'  },
    { type: 'referral',           label: 'Invite Ambassador',    bonus: '+300 IP Bonus', icon: <UserCheck className="h-4 w-4" />, color: 'purple' },
    { type: 'profile_completion', label: 'Complete Persona',     bonus: '+50 IP Bonus',  icon: <UserCheck className="h-4 w-4" />, color: 'cyan'   },
    { type: 'social_share',       label: 'Social Media Share',   bonus: '+25 IP Bonus',  icon: <Share2 className="h-4 w-4" />,    color: 'blue'   },
  ];

  const colorMap = {
    amber:  { ring: 'hover:border-amber-500/40',  bg: 'bg-amber-500/15',  text: 'text-amber-400'  },
    purple: { ring: 'hover:border-purple-500/40', bg: 'bg-purple-500/15', text: 'text-purple-400' },
    cyan:   { ring: 'hover:border-cyan-500/40',   bg: 'bg-cyan-500/15',   text: 'text-cyan-400'   },
    blue:   { ring: 'hover:border-blue-500/40',   bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">

      {/* ── Page Title ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.07]">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold tracking-wide text-white flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-400 shrink-0" />
            ELESENE Brand Investment Dashboard
          </h1>
          <p className="text-[11px] text-zinc-500 mt-1.5 font-futura italic leading-relaxed">
            "You're not purchasing. You're investing in the ELESENE brand." — Lifetime Recognition &amp; Privileges
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="shrink-0 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-2.5 text-[11px] text-amber-300 flex items-center gap-2 cursor-default"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="font-futura tracking-wider">
            Referral Code:{' '}
            <strong className="font-mono text-amber-200 font-bold select-all">
              {summary?.user?.referralCode || 'ELESENE-VIP'}
            </strong>
          </span>
        </motion.div>
      </div>

      {/* ── Tier Card ── */}
      <InvestmentTierCard metrics={metrics} progress={progress} onRedeemClick={() => setIsRedeemOpen(true)} />

      {/* ── Investment Journey ── */}
      <InvestmentJourney metrics={metrics} progress={progress} />

      {/* ── Engagement Actions ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e0e] p-5 shadow-xl text-white">
        <h3 className="text-[10px] font-futura font-bold uppercase tracking-[0.2em] text-amber-400/80 mb-5 flex items-center gap-2">
          <Gift className="h-3.5 w-3.5" />
          Earn Engagement Investment Bonuses
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {engagementActions.map((action) => {
            const c = colorMap[action.color];
            return (
              <motion.button
                key={action.type}
                disabled={engaging}
                onClick={() => handleEngagementBonus(action.type)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#141414] p-4 text-left transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${c.ring}`}
              >
                <div className={`rounded-lg p-2.5 shrink-0 ${c.bg} ${c.text}`}>
                  {action.icon}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-zinc-200 block leading-snug">{action.label}</span>
                  <span className={`text-[10px] font-mono font-bold mt-0.5 block ${c.text}`}>{action.bonus}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Timeline & History ── */}
      <InvestmentTimeline transactions={history} />

      {/* ── AI Concierge ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e0e] p-6 shadow-xl text-white">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-display font-semibold text-white tracking-wide">AI Investment Concierge</h2>
            <p className="text-[11px] text-zinc-500 font-futura mt-0.5">Ask questions about your brand standing, tier perks, or campaign multipliers.</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-4 h-52 overflow-y-auto space-y-3 text-xs mb-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 leading-relaxed font-futura ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-[#141414] text-zinc-300 border border-white/[0.06]'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-[#141414] text-zinc-400 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-white/[0.06]">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
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
            placeholder="e.g. What privileges do I unlock at Gold tier?"
            className="flex-1 bg-[#0a0a0a] border border-white/[0.07] rounded-xl px-4 py-2.5 text-xs text-white font-futura focus:outline-none focus:border-amber-500/50 placeholder-zinc-600 transition-colors"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* ── Redemption Modal ── */}
      <RewardRedemptionModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        currentLp={metrics?.loyaltyPoints || 0}
        onSuccess={loadData}
      />
    </div>
  );
};

export default LoyaltyPage;
