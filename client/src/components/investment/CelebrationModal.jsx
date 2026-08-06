import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, ChevronRight } from 'lucide-react';

export default function CelebrationModal({ isOpen, onClose, ipEarned, lpEarned, newTier, tierUpgraded }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-2xl text-stone-900"
        >
          {/* Top Metallic Burst background */}
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-amber-200 to-yellow-300 opacity-40 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-200 to-teal-300 opacity-40 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <motion.div
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md"
            >
              <Award className="h-10 w-10" />
            </motion.div>

            <h2 className="text-2xl font-semibold tracking-wide text-stone-900">
              {tierUpgraded ? '🎉 Tier Elevated!' : 'Investment Contribution Celebrated'}
            </h2>

            <p className="text-xs text-stone-500 max-w-xs">
              Thank you for investing in the ELESENE brand. Your order payment has been successfully recorded.
            </p>

            {/* Points Summary Badge */}
            <div className="my-2 grid grid-cols-2 gap-3 w-full">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold block">Investment Points</span>
                <span className="font-mono text-xl font-bold text-amber-800 mt-0.5 block">+{ipEarned || 0} IP</span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold block">Loyalty Points</span>
                <span className="font-mono text-xl font-bold text-emerald-800 mt-0.5 block">+{lpEarned || 0} LP</span>
              </div>
            </div>

            {newTier && (
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 w-full flex items-center justify-between text-xs">
                <span className="text-stone-500">Current Brand Standing:</span>
                <span className="font-semibold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {newTier} Tier
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 text-xs font-semibold text-white shadow-md hover:brightness-105 cursor-pointer"
            >
              <span>Continue to Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

