import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Truck, Ticket, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { redeemPoints } from '../../api/loyalty';

const REWARD_OPTIONS = [
  {
    id: 'coupon-100',
    title: '₹500 Discount Coupon',
    type: 'coupon',
    lpCost: 50,
    icon: <Ticket className="h-5 w-5 text-amber-400" />,
    desc: 'Applicable on any purchase over ₹2,999.',
  },
  {
    id: 'shipping-free',
    title: 'Complimentary Express Shipping',
    type: 'free_shipping',
    lpCost: 30,
    icon: <Truck className="h-5 w-5 text-cyan-400" />,
    desc: 'Free express shipping on your next order.',
  },
  {
    id: 'coupon-250',
    title: '₹1,500 VIP Voucher',
    type: 'coupon',
    lpCost: 120,
    icon: <Ticket className="h-5 w-5 text-purple-400" />,
    desc: 'Exclusive discount voucher for new collections.',
  },
  {
    id: 'gift-silk-scarf',
    title: 'Silk Scarf Gift Voucher',
    type: 'product',
    lpCost: 200,
    icon: <Gift className="h-5 w-5 text-rose-400" />,
    desc: 'Complimentary ELESENE Mulberry Silk Scarf on next order.',
  },
];

export default function RewardRedemptionModal({ isOpen, onClose, currentLp, onSuccess }) {
  const [selectedReward, setSelectedReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redeemedResult, setRedeemedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRedeem = async () => {
    if (!selectedReward) return;
    if (currentLp < selectedReward.lpCost) {
      setError(`Insufficient LP balance. Needed ${selectedReward.lpCost} LP, you have ${currentLp} LP.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await redeemPoints({
        rewardTitle: selectedReward.title,
        rewardType: selectedReward.type,
        lpCost: selectedReward.lpCost,
      });

      if (res.success) {
        setRedeemedResult(res);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to redeem reward');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (redeemedResult?.couponCode) {
      navigator.clipboard.writeText(redeemedResult.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 p-6 md:p-8 shadow-2xl text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {!redeemedResult ? (
            <>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-light tracking-wide">Redeem Loyalty Points</h3>
                  <p className="text-xs text-neutral-400">
                    Available Balance: <span className="font-semibold text-emerald-400">{currentLp} LP</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-950/50 p-3 text-xs text-rose-300 border border-rose-800/40">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rewards List */}
              <div className="mt-6 space-y-3 max-h-64 overflow-y-auto pr-1">
                {REWARD_OPTIONS.map((reward) => {
                  const isSelected = selectedReward?.id === reward.id;
                  const canAfford = currentLp >= reward.lpCost;

                  return (
                    <div
                      key={reward.id}
                      onClick={() => canAfford && setSelectedReward(reward)}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : canAfford
                          ? 'border-white/10 bg-neutral-900/50 hover:border-white/20'
                          : 'border-white/5 bg-neutral-900/20 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-black/40 p-2">{reward.icon}</div>
                        <div>
                          <h4 className="text-sm font-medium">{reward.title}</h4>
                          <p className="text-xs text-neutral-400">{reward.desc}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs font-semibold text-emerald-400">
                        {reward.lpCost} LP
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action */}
              <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedReward || loading}
                  onClick={handleRedeem}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Redemption'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-light text-white">Reward Unlocked!</h3>
              <p className="text-xs text-neutral-300">
                You have successfully redeemed <span className="font-semibold text-emerald-400">{selectedReward?.title}</span>.
              </p>

              <div className="my-4 rounded-xl border border-dashed border-emerald-500/40 bg-neutral-900 p-4">
                <span className="text-[10px] uppercase text-neutral-400 block tracking-widest">Your Exclusive Coupon Code</span>
                <span className="font-mono text-lg font-bold text-emerald-400 mt-1 block tracking-wider">
                  {redeemedResult.couponCode}
                </span>
                <button
                  onClick={copyCode}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-emerald-500"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
