import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyInvestmentSummary, getMyInvestmentHistory, engageActivity, askLoyaltyAI } from '../../api/loyalty';
import InvestmentTierCard from '../../components/investment/InvestmentTierCard';
import InvestmentTimeline from '../../components/investment/InvestmentTimeline';
import RewardRedemptionModal from '../../components/investment/RewardRedemptionModal';
import InvestmentJourney from '../../components/investment/InvestmentJourney';
import { Sparkles, Trophy, Gift, RefreshCw, Send, Star, Share2, UserCheck, HelpCircle } from 'lucide-react';

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

  const suggestedQuestions = [
    { label: '💎 Loyalty Points (LP)', query: 'How do I earn and redeem spendable Loyalty Points (LP)?' },
    { label: '👑 Tier Privileges', query: 'What privileges do I unlock at Gold and Platinum tiers?' },
    { label: '🚀 Campaign Multipliers', query: 'How do promotional campaign multipliers boost my points?' },
    { label: '🎁 Voucher Redemption', query: 'How do I redeem my Loyalty Points for reward vouchers?' },
  ];

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

  const executeAskAI = async (textToAsk) => {
    if (!textToAsk.trim() || aiLoading) return;
    const userText = textToAsk.trim();
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

  const handleAskAI = (e) => {
    e.preventDefault();
    executeAskAI(aiQuery);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span className="text-sm font-futura tracking-wider">Retrieving your ELESENE Brand Investment privileges...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-rose-300 text-center my-6">
        <p className="font-medium">{error}</p>
        <button onClick={loadData} className="mt-3 px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 rounded-xl text-xs font-semibold uppercase tracking-wider text-stone-900 transition">
          Try Again
        </button>
      </div>
    );
  }

  const metrics = summary?.metrics || {};
  const progress = summary?.progress || {};

  const engagementActions = [
    { type: 'review',             label: 'Write Product Review', bonus: '+20 IP Bonus',  icon: <Star className="h-4 w-4" />,     color: 'amber'  },
    { type: 'referral',           label: 'Invite Ambassador',    bonus: '+300 IP Bonus', icon: <UserCheck className="h-4 w-4" />, color: 'gold'   },
    { type: 'profile_completion', label: 'Complete Persona',     bonus: '+50 IP Bonus',  icon: <UserCheck className="h-4 w-4" />, color: 'cyan'   },
    { type: 'social_share',       label: 'Social Media Share',   bonus: '+25 IP Bonus',  icon: <Share2 className="h-4 w-4" />,    color: 'blue'   },
  ];

  const colorMap = {
    amber:  { ring: 'hover:border-[#B99246]/40',  bg: 'bg-[#B99246]/10',  text: 'text-[#B99246]' },
    gold:   { ring: 'hover:border-[#B99246]/40',  bg: 'bg-[#B99246]/15',  text: 'text-[#B99246]' },
    cyan:   { ring: 'hover:border-cyan-500/40',   bg: 'bg-cyan-500/15',   text: 'text-cyan-600'  },
    blue:   { ring: 'hover:border-[#2F6BFF]/40',  bg: 'bg-[#2F6BFF]/10',  text: 'text-[#2F6BFF]' },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">

      {/* ── Page Title ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold tracking-wide text-stone-900 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-600 shrink-0" />
            ELESENE Brand Investment Dashboard
          </h1>
          <p className="text-[11px] text-stone-500 mt-1.5 font-futura italic leading-relaxed">
            &quot;You&apos;re not purchasing. You&apos;re investing in the ELESENE brand.&quot; — Lifetime Recognition &amp; Privileges
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="shrink-0 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-900 flex items-center gap-2 cursor-default shadow-2xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="font-futura tracking-wider">
            Referral Code:{' '}
            <strong className="font-mono text-amber-950 font-bold select-all">
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
      <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm text-stone-900">
        <h3 className="text-[10px] font-futura font-bold uppercase tracking-[0.2em] text-amber-700 mb-5 flex items-center gap-2">
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
                className={`flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-4 text-left transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 cursor-pointer ${c.ring}`}
              >
                <div className={`rounded-lg p-2.5 shrink-0 ${c.bg} ${c.text}`}>
                  {action.icon}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-800 block leading-snug">{action.label}</span>
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
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm text-stone-900 space-y-4">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 border border-amber-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-display font-semibold text-stone-900 tracking-wide">
              AI Investment Concierge
            </h2>
            <p className="text-[11px] text-stone-500 font-futura mt-0.5">Ask questions about tier privileges, point balances, or reward redemptions.</p>
          </div>
        </div>

        {/* Chat History Window */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 h-56 overflow-y-auto space-y-3 text-xs">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-2.5 leading-relaxed font-futura ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                  : 'bg-white text-stone-700 border border-stone-200 shadow-2xs'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-stone-500 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-stone-200">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                <span>Consulting AI Concierge...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Messages Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            Suggested Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                disabled={aiLoading}
                onClick={() => executeAskAI(sq.query)}
                className="rounded-lg border border-stone-200 bg-stone-50/90 px-3 py-1.5 text-[11px] font-medium text-stone-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 transition-all cursor-pointer disabled:opacity-50"
              >
                {sq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAskAI} className="flex gap-2 pt-1">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g. What privileges do I unlock at Gold tier?"
            className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-futura focus:outline-none focus:border-amber-500 placeholder-stone-400 transition-colors shadow-2xs"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
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



