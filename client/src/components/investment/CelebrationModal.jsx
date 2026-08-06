import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function CelebrationModal({ isOpen, onClose, ipEarned, lpEarned, newTier, tierUpgraded }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-neutral-950 p-8 text-center shadow-2xl text-white"
        >
          {/* Top Metallic Burst background */}
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 opacity-25 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-25 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <motion.div
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black shadow-xl"
            >
              <Award className="h-10 w-10" />
            </motion.div>

            <h2 className="text-2xl font-extralight tracking-wide text-white">
              {tierUpgraded ? '🎉 Tier Elevated!' : 'Investment Contribution Celebrated'}
            </h2>

            <p className="text-xs text-neutral-400 max-w-xs">
              Thank you for investing in the ELESENE brand. Your order payment has been successfully recorded.
            </p>

            {/* Points Summary Badge */}
            <div className="my-2 grid grid-cols-2 gap-3 w-full">
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 block">Investment Points</span>
                <span className="font-mono text-xl font-bold text-amber-300 mt-0.5 block">+{ipEarned || 0} IP</span>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 block">Loyalty Points</span>
                <span className="font-mono text-xl font-bold text-emerald-300 mt-0.5 block">+{lpEarned || 0} LP</span>
              </div>
            </div>

            {newTier && (
              <div className="rounded-xl bg-neutral-900 border border-white/10 p-3 w-full flex items-center justify-between text-xs">
                <span className="text-neutral-400">Current Brand Standing:</span>
                <span className="font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {newTier} Tier
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 text-xs font-semibold text-black shadow-lg hover:brightness-110"
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
