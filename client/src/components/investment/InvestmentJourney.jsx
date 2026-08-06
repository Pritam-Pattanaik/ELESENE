import React from 'react';
import { motion } from 'framer-motion';

// Defined tiers with their IP thresholds, styling attributes, and custom SVGs
const TIERS_CONFIG = [
  {
    name: 'Seed',
    minPoints: 0,
    maxPoints: 2999,
    themeColor: 'emerald',
    colorHex: '#10b981',
    activeStyle: 'border-emerald-500 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-50',
    inactiveStyle: 'border-stone-200 text-stone-400 bg-stone-50',
    innerActiveStyle: 'border-emerald-300 bg-white',
    innerInactiveStyle: 'border-stone-100 bg-white',
    icon: (className) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20h10" />
        <path d="M12 20v-8" />
        <path d="M12 12a5 5 0 0 1 5-5c1.5 0 3 .5 3 .5s-.5 1.5-.5 3a5 5 0 0 1-5 5h-2.5" />
        <path d="M12 14a5 5 0 0 0-5-5c-1.5 0-3 .5-3 .5s.5 1.5.5 3a5 5 0 0 0 5 5h2.5" />
      </svg>
    )
  },
  {
    name: 'Bronze',
    minPoints: 3000,
    maxPoints: 7999,
    themeColor: 'bronze',
    colorHex: '#c27a3f',
    activeStyle: 'border-[#c27a3f] text-[#c27a3f] shadow-[0_0_15px_rgba(194,122,63,0.3)] bg-amber-50',
    inactiveStyle: 'border-stone-200 text-stone-400 bg-stone-50',
    innerActiveStyle: 'border-[#c27a3f]/30 bg-white',
    innerInactiveStyle: 'border-stone-100 bg-white',
    icon: (className) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15 8.5 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 8.5 12 2" />
      </svg>
    )
  },
  {
    name: 'Silver',
    minPoints: 8000,
    maxPoints: 14999,
    themeColor: 'silver',
    colorHex: '#64748b',
    activeStyle: 'border-slate-400 text-slate-700 shadow-[0_0_15px_rgba(100,116,139,0.3)] bg-slate-50',
    inactiveStyle: 'border-stone-200 text-stone-400 bg-stone-50',
    innerActiveStyle: 'border-slate-300 bg-white',
    innerInactiveStyle: 'border-stone-100 bg-white',
    icon: (className) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15 8.5 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 8.5 12 2" />
      </svg>
    )
  },
  {
    name: 'Gold',
    minPoints: 15000,
    maxPoints: 29999,
    themeColor: 'gold',
    colorHex: '#d97706',
    activeStyle: 'border-amber-500 text-amber-700 shadow-[0_0_15px_rgba(217,119,6,0.3)] bg-amber-50',
    inactiveStyle: 'border-stone-200 text-stone-400 bg-stone-50',
    innerActiveStyle: 'border-amber-300 bg-white',
    innerInactiveStyle: 'border-stone-100 bg-white',
    icon: (className) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        <path d="M3 20h18" />
      </svg>
    )
  },
  {
    name: 'Platinum',
    minPoints: 30000,
    maxPoints: 59999,
    themeColor: 'platinum',
    colorHex: '#a855f7',
    activeStyle: 'border-purple-500 text-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-50',
    inactiveStyle: 'border-stone-200 text-stone-400 bg-stone-50',
    innerActiveStyle: 'border-purple-300 bg-white',
    innerInactiveStyle: 'border-stone-100 bg-white',
    icon: (className) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M11 3L8 9l4 12 4-12-3-6" />
        <path d="M2 9h20" />
      </svg>
    )
  },
  {
    name: 'Diamond',
    minPoints: 60000,
    maxPoints: null,
    themeColor: 'diamond',
    colorHex: '#f59e0b',
    activeStyle: 'border-amber-500 text-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-amber-50',
    inactiveStyle: 'border-stone-200 text-stone-400 bg-stone-50',
    innerActiveStyle: 'border-amber-300 bg-white',
    innerInactiveStyle: 'border-stone-100 bg-white',
    icon: (className) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M12 3v18" />
        <path d="M3.5 9h17" />
        <path d="M2 9l10 12L22 9" />
        <path d="M12 3L6 9l6 12 6-9-6-12" />
      </svg>
    )
  }
];

export default function InvestmentJourney({ metrics, progress }) {
  const currentIp = metrics?.investmentPoints || 0;

  // Normalise current tier name from database summary (defaults to 'Seed' if missing)
  const rawTier = metrics?.investmentTier || 'Seed';
  const currentTierName = rawTier.charAt(0).toUpperCase() + rawTier.slice(1).toLowerCase();

  // Find index of current tier
  const currentTierIndex = TIERS_CONFIG.findIndex(t => t.name === currentTierName);
  const activeTierIndex = currentTierIndex !== -1 ? currentTierIndex : 0;

  // Calculate percentage of line completed
  const getLineProgressPercent = () => {
    if (activeTierIndex === 0) {
      const nextMin = TIERS_CONFIG[1].minPoints;
      const progressRatio = Math.min(1, currentIp / nextMin);
      return progressRatio * 20;
    }
    if (activeTierIndex === TIERS_CONFIG.length - 1) {
      return 100;
    }
    const completedSegmentsPercent = activeTierIndex * 20;
    const currentTierObj = TIERS_CONFIG[activeTierIndex];
    const nextTierObj = TIERS_CONFIG[activeTierIndex + 1];
    const range = nextTierObj.minPoints - currentTierObj.minPoints;
    const currentProgressInSegment = currentIp - currentTierObj.minPoints;
    const segmentRatio = Math.min(1, Math.max(0, currentProgressInSegment / range));
    return completedSegmentsPercent + (segmentRatio * 20);
  };

  const lineProgress = getLineProgressPercent();

  // Next Tier computation for progress bar
  const nextTierObj = TIERS_CONFIG[activeTierIndex + 1] || null;
  const progressPct = progress?.progressPct || 0;
  const pointsToNext = progress?.pointsToNext || 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm text-stone-900 select-none">
      {/* Subtle radial metallic reflection */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/[0.05] rounded-full blur-[40px] pointer-events-none" />

      {/* Header title */}
      <h3 className="text-left text-[10px] font-futura tracking-[0.25em] text-[#c27a3f] uppercase font-bold mb-8">
        YOUR INVESTMENT JOURNEY
      </h3>

      {/* Roadmap visualization container */}
      <div className="w-full overflow-x-auto scrollbar-none pb-2">
        <div className="relative flex items-center justify-between min-w-[750px] px-8 py-5 z-10">
          
          {/* Connector timeline background line */}
          <div className="absolute h-[2px] bg-stone-200 top-1/2 left-[8%] right-[8%] -translate-y-1/2 z-0" />

          {/* Glowing completion progress line */}
          <div 
            className="absolute h-[2px] bg-gradient-to-r from-emerald-500 via-[#c27a3f] to-amber-500 top-1/2 left-[8%] -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
            style={{ width: `${lineProgress * 0.84}%` }} 
          />

          {/* Middle connector dot markers */}
          {[10, 30, 50, 70, 90].map((pos) => {
            const isDotPassed = lineProgress >= pos;
            return (
              <div 
                key={pos}
                className={`absolute w-2.5 h-2.5 rounded-full border -translate-y-1/2 z-10 transition-all duration-700 ${
                  isDotPassed 
                    ? 'border-[#c27a3f] bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                    : 'border-stone-300 bg-stone-100'
                }`}
                style={{ left: `${pos + 1}%`, top: '50%' }}
              />
            );
          })}

          {/* Tier nodes */}
          {TIERS_CONFIG.map((tier, idx) => {
            const isCurrent = idx === activeTierIndex;
            const isCompleted = idx < activeTierIndex;
            const isUpcoming = idx > activeTierIndex;

            let circleClass = tier.inactiveStyle;
            let innerClass = tier.innerInactiveStyle;
            let iconClass = 'w-5 h-5 text-stone-400 opacity-60 transition-all duration-500';

            if (isCurrent) {
              circleClass = tier.activeStyle;
              innerClass = tier.innerActiveStyle;
              iconClass = `w-5 h-5 transition-all duration-500 ${
                tier.themeColor === 'emerald' ? 'text-emerald-600' :
                tier.themeColor === 'bronze' ? 'text-[#c27a3f]' :
                tier.themeColor === 'silver' ? 'text-slate-600' :
                tier.themeColor === 'gold' ? 'text-amber-600' :
                tier.themeColor === 'platinum' ? 'text-purple-600' :
                'text-amber-600'
              }`;
            } else if (isCompleted) {
              circleClass = 'border-stone-300 text-stone-700 bg-stone-100';
              innerClass = 'border-stone-200 bg-white';
              iconClass = 'w-5 h-5 text-stone-700 opacity-90';
            } else {
              circleClass = 'border-stone-200 text-stone-400 bg-stone-50';
              innerClass = 'border-stone-200/60 bg-white';
              iconClass = 'w-5 h-5 text-stone-400 opacity-50';
            }

            return (
              <div key={tier.name} className="flex flex-col items-center select-none relative z-10 shrink-0">
                {/* Double-ring node circle */}
                <div className={`w-[54px] h-[54px] rounded-full border-2 flex items-center justify-center transition-all duration-700 ${circleClass}`}>
                  <div className={`w-[42px] h-[42px] rounded-full border flex items-center justify-center transition-all duration-700 ${innerClass}`}>
                    {tier.icon(iconClass)}
                  </div>
                </div>

                {/* Tier Name */}
                <span className={`text-[10px] font-futura tracking-[0.15em] font-bold uppercase mt-3.5 transition-colors duration-500 ${
                  isCurrent 
                    ? tier.themeColor === 'emerald' ? 'text-emerald-700' :
                      tier.themeColor === 'bronze' ? 'text-[#c27a3f]' :
                      tier.themeColor === 'silver' ? 'text-slate-700' :
                      tier.themeColor === 'gold' ? 'text-amber-700' :
                      tier.themeColor === 'platinum' ? 'text-purple-700' :
                      'text-amber-700'
                    : isCompleted ? 'text-stone-800' : 'text-stone-400'
                }`}>
                  {tier.name}
                </span>

                {/* Status or Requirement */}
                {isCurrent ? (
                  <div className="absolute top-[88px] flex justify-center w-32 pointer-events-none">
                    <span className="text-[8px] font-futura tracking-[0.1em] font-bold text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full bg-emerald-50 uppercase shadow-sm">
                      YOU ARE HERE
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] font-mono text-stone-400 mt-1 font-semibold">
                    {tier.minPoints > 0 ? `${tier.minPoints.toLocaleString()} IP` : '0 IP'}
                  </span>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* Spacer to avoid overlap with 'YOU ARE HERE' absolute pills on small screens */}
      <div className="h-6" />

      {/* Progress Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-stone-200/80">
        
        {/* Next Tier target text */}
        <div className="text-[11px] font-futura tracking-wider text-stone-500">
          {nextTierObj ? (
            <span>
              Progress to <strong className="text-amber-600 font-bold uppercase tracking-widest">{nextTierObj.name}</strong>
            </span>
          ) : (
            <span className="text-purple-700 font-semibold uppercase tracking-widest">
              Pinnacle Tier Reached 👑
            </span>
          )}
        </div>

        {/* Progress bar line */}
        <div className="flex-1 h-3.5 bg-stone-200 border border-stone-300/60 rounded-full overflow-hidden p-0.5 max-w-[460px] w-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${nextTierObj ? progressPct : 100}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
          />
        </div>

        {/* Remaining points count */}
        <div className="text-[10px] font-mono text-stone-500 font-semibold tracking-wider">
          {nextTierObj ? (
            <span>{pointsToNext.toLocaleString()} IP Remaining ({progressPct}%)</span>
          ) : (
            <span>{currentIp.toLocaleString()} IP Total (100%)</span>
          )}
        </div>

      </div>
    </div>
  );
}

