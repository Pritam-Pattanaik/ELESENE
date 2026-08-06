import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyInvestmentSummary, getMyInvestmentHistory, engageActivity, askLoyaltyAI } from '../../api/loyalty';
import InvestmentTierCard from '../../components/investment/InvestmentTierCard';
import InvestmentTimeline from '../../components/investment/InvestmentTimeline';
import RewardRedemptionModal from '../../components/investment/RewardRedemptionModal';
import { Sparkles, Trophy, Award, Gift, RefreshCw, Send, Star, Share2, UserCheck } from 'lucide-react';

const LoyaltyPage = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [engaging, setEngaging] = useState(false);

  // AI Concierge Chat state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Greetings! I am your ELESENE Investment Concierge. Ask me anything about your lifetime brand standing, tier perks, or reward redemptions.',
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, histRes] = await Promise.all([
        getMyInvestmentSummary(),
        getMyInvestmentHistory({ page: 1, limit: 15 }),
      ]);
      setSummary(sumRes);
      if (histRes?.transactions) {
        setHistory(histRes.transactions);
      }
    } catch (err) {
      setError(err.message || 'Failed to load brand investment summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEngagementBonus = async (type) => {
    if (engaging) return;
    setEngaging(true);
    try {
      const res = await engageActivity(type);
      if (res.awarded) {
        await loadData();
      } else if (res.message) {
        alert(res.message);
      }
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
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: res.answer || 'I could not retrieve an answer at this time.' },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `Sorry, ${err.message || 'something went wrong.'}` },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span>Retrieving your ELESENE Brand Investment privileges...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-rose-300 text-center my-6">
        <p className="font-medium">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 rounded-xl text-xs font-semibold uppercase tracking-wider text-white transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const metrics = summary?.metrics || {};
  const progress = summary?.progress || {};

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-stone-900 flex items-center gap-3">
            <Trophy className="h-7 w-7 text-amber-600 shrink-0" />
            ELESENE Brand Investment Dashboard
          </h1>
          <p className="text-xs text-stone-600 mt-1 font-medium">
            "You're not purchasing. You're investing in the ELESENE brand." — Lifetime Recognition & Privileges
          </p>
        </div>

        <div className="rounded-xl border border-amber-900/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-950 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span>Referral Code: <strong className="font-mono text-amber-950 font-bold">{summary?.user?.referralCode || 'ELESENE-VIP'}</strong></span>
        </div>
      </div>

      {/* ─── Core Hero Investment Tier Card ────────────────────────────────────── */}
      <InvestmentTierCard
        metrics={metrics}
        progress={progress}
        onRedeemClick={() => setIsRedeemOpen(true)}
      />

      {/* ─── Engagement Actions Bar ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-stone-800 bg-[#121118] p-6 shadow-2xl text-white">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200 mb-4 flex items-center gap-2">
          <Gift className="h-4 w-4 text-amber-400" />
          Earn Engagement Investment Bonuses
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            disabled={engaging}
            onClick={() => handleEngagementBonus('review')}
            className="flex items-center gap-3 rounded-xl border border-stone-800 bg-neutral-900 p-4 hover:border-amber-500/50 hover:bg-neutral-850 transition text-left"
          >
            <div className="rounded-lg bg-amber-500/20 p-2.5 text-amber-400 shrink-0">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Write Product Review</span>
              <span className="text-[11px] text-amber-400 font-mono font-medium">+20 IP Bonus</span>
            </div>
          </button>

          <button
            disabled={engaging}
            onClick={() => handleEngagementBonus('referral')}
            className="flex items-center gap-3 rounded-xl border border-stone-800 bg-neutral-900 p-4 hover:border-purple-500/50 hover:bg-neutral-850 transition text-left"
          >
            <div className="rounded-lg bg-purple-500/20 p-2.5 text-purple-400 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Invite Ambassador</span>
              <span className="text-[11px] text-purple-400 font-mono font-medium">+300 IP Bonus</span>
            </div>
          </button>

          <button
            disabled={engaging}
            onClick={() => handleEngagementBonus('profile_completion')}
            className="flex items-center gap-3 rounded-xl border border-stone-800 bg-neutral-900 p-4 hover:border-cyan-500/50 hover:bg-neutral-850 transition text-left"
          >
            <div className="rounded-lg bg-cyan-500/20 p-2.5 text-cyan-400 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Complete Persona</span>
              <span className="text-[11px] text-cyan-400 font-mono font-medium">+50 IP Bonus</span>
            </div>
          </button>

          <button
            disabled={engaging}
            onClick={() => handleEngagementBonus('social_share')}
            className="flex items-center gap-3 rounded-xl border border-stone-800 bg-neutral-900 p-4 hover:border-blue-500/50 hover:bg-neutral-850 transition text-left"
          >
            <div className="rounded-lg bg-blue-500/20 p-2.5 text-blue-400 shrink-0">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Social Media Share</span>
              <span className="text-[11px] text-blue-400 font-mono font-medium">+25 IP Bonus</span>
            </div>
          </button>
        </div>
      </div>

      {/* ─── Timeline & History ─────────────────────────────────────────────── */}
      <InvestmentTimeline transactions={history} />

      {/* ─── Grok AI Concierge Chat ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-stone-800 bg-[#121118] p-6 md:p-8 shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-light tracking-wide text-white">AI Investment Concierge</h2>
            <p className="text-xs text-neutral-300">Ask questions regarding your brand standing, tier perks, or campaign multipliers.</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-stone-800 rounded-xl p-4 h-56 overflow-y-auto space-y-3 text-xs mb-4">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-neutral-900 text-neutral-200 border border-stone-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-900 text-neutral-300 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-stone-800">
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
            className="flex-1 bg-neutral-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-neutral-400 font-medium"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* ─── Redemption Modal ──────────────────────────────────────────────── */}
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
