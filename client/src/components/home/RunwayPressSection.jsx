import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../effects/ScrollReveal';

const reviews = [
  {
    id: 1,
    publication: 'VOGUE INTERNATIONAL',
    quote: 'ELESENE redefines modern luxury with sculptural silhouettes that make a commanding yet fluid statement on the Paris runway.',
    rating: 5,
    author: 'Couture Editor',
    issue: 'A/W 2026 Issue'
  },
  {
    id: 2,
    publication: "HARPER'S BAZAAR",
    quote: 'The 3D Product Orbit experience paired with immaculate Italian Mulberry silk marks a masterclass in fashion innovation.',
    rating: 5,
    author: 'Senior Fashion Director',
    issue: 'Milan Fashion Week'
  },
  {
    id: 3,
    publication: 'ELLE COUTURE',
    quote: 'Every seam feels like a work of architectural art. ELESENE is the definitive brand for the discerning global woman.',
    rating: 5,
    author: 'Fashion Critic',
    issue: 'Global Style Review'
  }
];

const RunwayPressSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="relative py-24 md:py-32 bg-ivory text-white overflow-hidden">
      
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-16 relative z-10 text-center">
        
        <ScrollReveal variant="fade-up" className="mb-12">
          <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-gold font-bold block mb-3">
            RUNWAY REVIEWS & ACCOLADES
          </span>
          <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-wide">
            Critically <span className="italic text-gold">Acclaimed</span>
          </h2>
        </ScrollReveal>

        {/* Review Card Slider */}
        <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-14 backdrop-blur-md shadow-2xl relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={reviews[activeIdx].id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Star Rating */}
              <div className="flex justify-center gap-1.5 text-gold text-lg">
                {[...Array(reviews[activeIdx].rating)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg md:text-2xl font-serif italic text-white/90 leading-relaxed font-normal">
                "{reviews[activeIdx].quote}"
              </p>

              {/* Publication Details */}
              <div>
                <h4 className="text-sm font-sans font-bold tracking-[0.25em] text-gold uppercase">
                  {reviews[activeIdx].publication}
                </h4>
                <p className="text-xs text-white/50 font-sans mt-1 font-light">
                  {reviews[activeIdx].author} • {reviews[activeIdx].issue}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator Navigation */}
          <div className="flex justify-center gap-3 mt-10">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setActiveIdx(i)}
                aria-label={`Go to review ${i + 1}`}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIdx === i ? 'bg-gold w-8' : 'bg-white/20 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default RunwayPressSection;
