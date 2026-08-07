import { motion } from 'framer-motion';
import { ShieldCheck, Award, Zap, ChevronRight } from 'lucide-react';

const TIER_THEMES = {
  Seed: {
    bg: 'from-amber-100/60 via-amber-50 to-white',
    accent: 'from-amber-500 to-yellow-500',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  Bronze: {
    bg: 'from-amber-100/80 via-orange-50 to-white',
    accent: 'from-amber-600 to-orange-500',
    border: 'border-amber-300',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  Silver: {
    bg: 'from-slate-100 via-slate-50 to-white',
    accent: 'from-slate-400 to-zinc-500',
    border: 'border-slate-300',
    text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  Gold: {
    bg: 'from-yellow-100/70 via-amber-50 to-white',
    accent: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  },
  Platinum: {
    bg: 'from-cyan-50 via-teal-50/50 to-white',
    accent: 'from-teal-400 to-cyan-600',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    badge: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  Diamond: {
    bg: 'from-amber-100/60 via-amber-50 to-white',
    accent: 'from-[#B99246] to-[#D4AF6A]',
    border: 'border-[#B99246]/30',
    text: 'text-[#B99246]',
    badge: 'bg-[#B99246]/15 text-[#B99246] border-[#B99246]/40',
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
    <div className="relative overflow-hidden rounded-2xl border border-[#E8E5DF] bg-white p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-[#141414]">
      {/* Subtle Background Accent Mesh */}
      <div className={`absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br ${theme.accent} opacity-15 blur-3xl`} />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header Badge & Level */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${theme.badge}`}>
              <Award className="h-4 w-4" />
              {tierName} Tier
            </span>
            <span className="text-xs text-[#6F6F6F] uppercase tracking-widest font-mono font-semibold">
              ELESENE INVESTMENT LEVEL {metrics?.investmentLevel || 1}
            </span>
          </div>

          <div className="rounded-lg bg-[#FAF9F7] border border-[#E8E5DF] px-3 py-1.5 text-[11px] text-[#141414] font-medium flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#2E8B57] shrink-0" />
            <span>Lifetime Brand Standing</span>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Lifetime Investment */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6F6F]">Total Lifetime Investment</span>
            <span className="text-3xl font-light tracking-tight text-[#141414] mt-1 font-mono">
              ₹{Number(lifetime).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-[#909090] mt-1">Lifetime Brand Purchase & Engagement Contribution</span>
          </div>

          {/* Investment Points */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-[#EFECE7] pt-4 md:pt-0 md:pl-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6F6F] flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#B99246]" />
              Investment Points (IP)
            </span>
            <span className={`text-3xl font-light tracking-tight mt-1 font-mono ${theme.text}`}>
              {ip.toLocaleString()} IP
            </span>
            <span className="text-[11px] text-[#909090] mt-1">Never expires • Determines Tier</span>
          </div>

          {/* Spendable Loyalty Points */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-[#EFECE7] pt-4 md:pt-0 md:pl-6 justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6F6F]">Spendable Loyalty Points (LP)</span>
              <span className="text-3xl font-light tracking-tight text-[#2E8B57] mt-1 block font-mono">
                {lp.toLocaleString()} LP
              </span>
            </div>
            <button
              onClick={onRedeemClick}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#141414] hover:bg-[#B99246] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer uppercase tracking-wider font-futura"
            >
              <span>Redeem Rewards</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar to Next Tier */}
        {nextTier ? (
          <div className="mt-2 flex flex-col gap-2 rounded-xl bg-[#FAF9F7] p-4 border border-[#E8E5DF]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#141414] font-semibold">
                Progress to <span className={theme.text}>{nextTier}</span> Tier
              </span>
              <span className="text-[#6F6F6F] font-mono font-medium">
                {pointsToNext.toLocaleString()} IP Remaining ({progressPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EFECE7] p-0.5 border border-[#E8E5DF]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${theme.accent}`}
              />
            </div>
          </div>
        ) : (
          <div className="mt-2 rounded-xl bg-[#B99246]/10 p-3 border border-[#B99246]/30 text-center text-xs text-[#141414] font-medium">
            👑 You have reached the pinnacle <span className="font-bold text-[#B99246]">{tierName} Tier</span> status! Enjoy executive brand privileges.
          </div>
        )}

        {/* Compliance Disclaimer Footnote */}
        <div className="text-[11px] text-stone-400 italic border-t border-stone-200/80 pt-3">
          * Note: ELESENE Brand Investment Points & Tiers represent customer recognition and lifetime engagement. Points hold no cash value, equity, dividends, or financial interest.
        </div>
      </div>
    </div>
  );
}


