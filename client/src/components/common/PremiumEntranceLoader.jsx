import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumEntranceLoader = ({ isFullPage = true, onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Single completion timer — 0 React re-renders during loading animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      if (onComplete) {
        setTimeout(onComplete, 700);
      }
    }, 2000);

    return () => clearTimeout(exitTimer);
  }, [onComplete]);

  const brandLetters = ['E', 'L', 'E', 'S', 'E', 'N', 'E'];

  return (
    <AnimatePresence>
      {!isExiting && (
        <div
          className={`${
            isFullPage ? 'fixed inset-0 z-[99999]' : 'relative w-full h-[600px]'
          } flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] select-none pointer-events-auto will-change-transform`}
        >
          {/* Top Curtain Panel */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: isExiting ? '-100%' : 0 }}
            transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            className="absolute top-0 left-0 right-0 h-1/2 bg-[#0A0A0A] border-b border-gold/20 z-0 will-change-transform"
          />

          {/* Bottom Curtain Panel */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: isExiting ? '100%' : 0 }}
            transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#0A0A0A] border-t border-gold/20 z-0 will-change-transform"
          />

          {/* Gold Radial Glow - Hardware Accelerated */}
          <div className="absolute w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full bg-gold/10 blur-[80px] pointer-events-none z-10 opacity-70 transform-gpu" />

          {/* Main Centered Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4 text-center max-w-5xl mx-auto"
          >
            {/* Top Monogram Crest */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-4 sm:gap-6 text-gold/80"
            >
              <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-gold/50 to-gold" />
              <span className="font-futura text-[10px] sm:text-xs tracking-[0.45em] uppercase text-gold font-medium">
                HAUTE COUTURE • PARIS • MUMBAI
              </span>
              <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-gold/50 to-gold" />
            </motion.div>

            {/* Extra Large Brand Reveal Typography (60fps GPU Hardware Accelerated) */}
            <div className="flex items-center justify-center gap-1 sm:gap-3 md:gap-4 py-2 sm:py-4">
              {brandLetters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 25, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.1 + index * 0.06,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                  className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-ivory drop-shadow-[0_0_20px_rgba(201,168,76,0.3)] select-none transform-gpu"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Atelier Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.95, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-col items-center gap-1 sm:gap-2"
            >
              <p className="font-accent text-lg sm:text-2xl md:text-3xl tracking-[0.4em] text-gold italic font-normal">
                ATELIER HAUTE COUTURE
              </p>
              <span className="font-futura text-[9px] sm:text-[11px] tracking-[0.35em] text-ivory/60 uppercase">
                ESTABLISHED 2026
              </span>
            </motion.div>

            {/* Smooth 60fps CSS GPU Progress Bar (Zero React Re-render Bottlenecks) */}
            <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3 w-64 sm:w-80 md:w-96">
              <div className="w-full h-[3px] bg-ivory/10 rounded-full overflow-hidden relative border border-gold/30 p-[0.5px]">
                <div
                  className="h-full bg-gradient-to-r from-gold-muted via-gold to-gold-light rounded-full shadow-[0_0_15px_#C9A84C] origin-left transform-gpu animate-premium-smooth-fill"
                />
              </div>

              <div className="flex items-center justify-between w-full font-futura text-[10px] sm:text-xs tracking-[0.25em] text-gold/90">
                <span className="uppercase font-medium">REVEALING EXPERIENCE</span>
                <span className="font-mono text-ivory font-bold uppercase animate-pulse">
                  PREMIUM
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumEntranceLoader;
