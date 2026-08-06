import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Zap, ChevronRight, Lock } from 'lucide-react';

const TIER_THEMES = {
  Seed: {
    bg: 'from-stone-800 via-neutral-900 to-black',
    accent: 'from-amber-700 to-yellow-600',
    border: 'border-amber-900/40',
    text: 'text-amber-400',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-800/50',
  },
  Bronze: {
    bg: 'from-amber-950 via-stone-900 to-black',
    accent: 'from-amber-600 to-orange-500',
    border: 'border-amber-700/40',
    text: 'text-amber-400',
    badge: 'bg-amber-900/60 text-amber-200 border-amber-700/50',
  },
  Silver: {
    bg: 'from-slate-800 via-zinc-900 to-black',
    accent: 'from-slate-300 to-zinc-400',
    border: 'border-slate-500/40',
    text: 'text-slate-300',
    badge: 'bg-slate-900/80 text-slate-200 border-slate-600/50',
  },
  Gold: {
    bg: 'from-yellow-950 via-amber-950 to-black',
    accent: 'from-yellow-400 via-amber-300 to-yellow-600',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
    badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-600/50',
  },
  Platinum: {
    bg: 'from-zinc-800 via-slate-900 to-neutral-950',
    accent: 'from-teal-300 via-cyan-200 to-slate-400',
    border: 'border-cyan-500/40',
    text: 'text-cyan-300',
    badge: 'bg-cyan-950/80 text-cyan-200 border-cyan-700/50',
  },
  Diamond: {
    bg: 'from-neutral-900 via-purple-950 to-black',
    accent: 'from-indigo-300 via-purple-300 to-pink-300',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    badge: 'bg-purple-950/80 text-purple-200 border-purple-600/50',
  },
};

export default function InvestmentTierCard({ metrics, progress, onRedeemClick }) {
  const tierName = metrics?.investmentTier || 'Seed';
  const theme = TIER_THEMES[tierName] || TIER_THEMES.Seed;

  const ip = metrics?.investmentPoints || 0;
  const lp = metrics?.loyaltyPoints || 0;
  const lifetime = metrics?.lifetimeInvestmentAmount || 0;

  const progressPct = progress?.progressPct || 0;
  const pointsToNext = progress?.pointsToNext || 0;
  const nextTier = progress?.nextTier;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-[#121118] p-6 md:p-8 shadow-2xl text-white">
      {/* Background Metallic Accent Mesh */}
      <div className={`absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br ${theme.accent} opacity-20 blur-3xl`} />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header Badge & Level */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${theme.badge}`}>
              <Award className="h-4 w-4" />
              {tierName} Tier
            </span>
            <span className="text-xs text-neutral-300 uppercase tracking-widest font-mono font-semibold">
              ELESENE INVESTMENT LEVEL {metrics?.investmentLevel || 1}
            </span>
          </div>

          <div className="rounded-lg bg-neutral-900 border border-stone-700/60 px-3 py-1.5 text-[11px] text-neutral-300 font-medium flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Lifetime Brand Standing</span>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Lifetime Investment */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Total Lifetime Investment</span>
            <span className="text-3xl font-light tracking-tight text-white mt-1 font-mono">
              ₹{Number(lifetime).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-neutral-400 mt-1">Lifetime Brand Purchase & Engagement Contribution</span>
          </div>

          {/* Investment Points */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-stone-800 pt-4 md:pt-0 md:pl-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Investment Points (IP)
            </span>
            <span className={`text-3xl font-light tracking-tight mt-1 font-mono ${theme.text}`}>
              {ip.toLocaleString()} IP
            </span>
            <span className="text-[11px] text-neutral-400 mt-1">Never expires • Determines Tier</span>
          </div>

          {/* Spendable Loyalty Points */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-stone-800 pt-4 md:pt-0 md:pl-6 justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Spendable Loyalty Points (LP)</span>
              <span className="text-3xl font-light tracking-tight text-emerald-400 mt-1 block font-mono">
                {lp.toLocaleString()} LP
              </span>
            </div>
            <button
              onClick={onRedeemClick}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Redeem Rewards</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar to Next Tier */}
        {nextTier ? (
          <div className="mt-2 flex flex-col gap-2 rounded-xl bg-neutral-900 p-4 border border-stone-700/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-200 font-semibold">
                Progress to <span className={theme.text}>{nextTier}</span> Tier
              </span>
              <span className="text-neutral-300 font-mono font-medium">
                {pointsToNext.toLocaleString()} IP Remaining ({progressPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-950 p-0.5 border border-stone-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${theme.accent}`}
              />
            </div>
          </div>
        ) : (
          <div className="mt-2 rounded-xl bg-purple-950/40 p-3 border border-purple-500/30 text-center text-xs text-purple-200 font-medium">
            👑 You have reached the pinnacle <span className="font-bold">{tierName} Tier</span> status! Enjoy executive brand privileges.
          </div>
        )}

        {/* Compliance Disclaimer Footnote */}
        <div className="text-[11px] text-neutral-400 italic border-t border-stone-800 pt-3">
          * Note: ELESENE Brand Investment Points & Tiers represent customer recognition and lifetime engagement. Points hold no cash value, equity, dividends, or financial interest.
        </div>
      </div>
    </div>
  );
}
