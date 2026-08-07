import { ArrowUpRight, ShoppingBag, Star, Share2, UserCheck, RefreshCw, Gift } from 'lucide-react';

const SOURCE_ICONS = {
  purchase: <ShoppingBag className="h-4 w-4 text-emerald-600" />,
  review: <Star className="h-4 w-4 text-amber-600" />,
  referral: <UserCheck className="h-4 w-4 text-purple-600" />,
  profile_completion: <UserCheck className="h-4 w-4 text-cyan-600" />,
  social_share: <Share2 className="h-4 w-4 text-blue-600" />,
  redemption: <Gift className="h-4 w-4 text-rose-600" />,
  admin_adjustment: <RefreshCw className="h-4 w-4 text-stone-500" />,
};

export default function InvestmentTimeline({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-white p-8 text-center text-stone-500 shadow-sm">
        <p className="text-xs font-medium">No investment activity logged yet. Your purchases and brand engagements will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-6 md:p-8 shadow-sm text-stone-900">
      <h3 className="text-lg font-semibold tracking-wide text-stone-900 mb-6">Investment Activity & Timeline</h3>

      <div className="relative border-l border-stone-200 ml-4 pl-6 space-y-6">
        {transactions.map((tx) => (
          <div key={tx.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 border border-stone-300 shadow-sm">
              {SOURCE_ICONS[tx.source] || <ArrowUpRight className="h-3.5 w-3.5 text-stone-600" />}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-stone-50 p-4 border border-stone-200/80 hover:border-stone-300 transition-all">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                    {tx.source.replace('_', ' ')}
                  </span>
                  {tx.multiplier > 1 && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      {tx.multiplier}x Multiplier
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-1 font-medium">{tx.description}</p>
                <span className="text-[10px] text-stone-400 font-mono mt-1">
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
                  <span className="text-amber-700">+{tx.investmentPoints} IP</span>
                )}
                {tx.loyaltyPoints !== 0 && (
                  <span className={tx.loyaltyPoints > 0 ? 'text-emerald-700' : 'text-rose-700'}>
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


