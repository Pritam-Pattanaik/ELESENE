import React from 'react';
import { ArrowUpRight, ShoppingBag, Star, Share2, UserCheck, RefreshCw, Gift } from 'lucide-react';

const SOURCE_ICONS = {
  purchase: <ShoppingBag className="h-4 w-4 text-emerald-400" />,
  review: <Star className="h-4 w-4 text-amber-400" />,
  referral: <UserCheck className="h-4 w-4 text-purple-400" />,
  profile_completion: <UserCheck className="h-4 w-4 text-cyan-400" />,
  social_share: <Share2 className="h-4 w-4 text-blue-400" />,
  redemption: <Gift className="h-4 w-4 text-rose-400" />,
  admin_adjustment: <RefreshCw className="h-4 w-4 text-neutral-400" />,
};

export default function InvestmentTimeline({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-800 bg-[#121118] p-8 text-center text-neutral-300 shadow-xl">
        <p className="text-xs font-medium">No investment activity logged yet. Your purchases and brand engagements will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-800 bg-[#121118] p-6 md:p-8 shadow-2xl text-white">
      <h3 className="text-lg font-light tracking-wide text-white mb-6">Investment Activity & Timeline</h3>

      <div className="relative border-l border-stone-700 ml-4 pl-6 space-y-6">
        {transactions.map((tx) => (
          <div key={tx.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 border border-stone-700 shadow-md">
              {SOURCE_ICONS[tx.source] || <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300" />}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-neutral-900 p-4 border border-stone-800 hover:border-stone-700 transition-all">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
                    {tx.source.replace('_', ' ')}
                  </span>
                  {tx.multiplier > 1 && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                      {tx.multiplier}x Multiplier
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-300 mt-1 font-medium">{tx.description}</p>
                <span className="text-[10px] text-neutral-400 font-mono mt-1">
                  {new Date(tx.created_at || tx.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:text-right font-mono text-xs font-semibold">
                {tx.investmentPoints > 0 && (
                  <span className="text-amber-400">+{tx.investmentPoints} IP</span>
                )}
                {tx.loyaltyPoints !== 0 && (
                  <span className={tx.loyaltyPoints > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {tx.loyaltyPoints > 0 ? `+${tx.loyaltyPoints}` : tx.loyaltyPoints} LP
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
