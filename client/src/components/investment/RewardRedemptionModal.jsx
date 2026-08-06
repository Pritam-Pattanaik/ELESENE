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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-2xl text-stone-900"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {!redeemedResult ? (
            <>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-wide text-stone-900">Redeem Loyalty Points</h3>
                  <p className="text-xs text-stone-500">
                    Available Balance: <span className="font-semibold text-emerald-600">{currentLp} LP</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
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
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                          : canAfford
                          ? 'border-stone-200 bg-stone-50/50 hover:border-stone-300 hover:bg-stone-50'
                          : 'border-stone-100 bg-stone-50/20 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 border border-stone-200/80 shadow-2xs">{reward.icon}</div>
                        <div>
                          <h4 className="text-sm font-medium text-stone-800">{reward.title}</h4>
                          <p className="text-xs text-stone-500">{reward.desc}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs font-semibold text-emerald-600">
                        {reward.lpCost} LP
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action */}
              <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4">
                <button
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedReward || loading}
                  onClick={handleRedeem}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Confirm Redemption'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900">Reward Unlocked!</h3>
              <p className="text-xs text-stone-600">
                You have successfully redeemed <span className="font-semibold text-emerald-600">{selectedReward?.title}</span>.
              </p>

              <div className="my-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4">
                <span className="text-[10px] uppercase text-stone-400 block tracking-widest">Your Exclusive Coupon Code</span>
                <span className="font-mono text-lg font-bold text-emerald-700 mt-1 block tracking-wider">
                  {redeemedResult.couponCode}
                </span>
                <button
                  onClick={copyCode}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white border border-stone-200 px-3 py-1.5 text-xs text-stone-700 hover:text-black shadow-2xs cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 cursor-pointer"
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

