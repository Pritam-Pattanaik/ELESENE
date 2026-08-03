import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const lookbookSlides = [
  {
    id: 'ch-1',
    numeral: 'I',
    title: 'Bohemian Spirit',
    tagline: 'ELESENE LOOKBOOK 2025',
    headingTop: 'THE ART',
    headingBottom: 'OF FORM',
    description: 'A study in contrasts. Capturing the tension between delicate embroidery and fluid, effortless movement under an open sky.',
    image: '/images/lookbook-bohemian-spirit.jpg',
    bgImage: '/images/lookbook-bohemian-spirit.jpg',
    slug: 'silk-slip-dress'
  },
  {
    id: 'ch-2',
    numeral: 'II',
    title: 'Urban Contrast',
    tagline: 'ELESENE LOOKBOOK 2025',
    headingTop: 'DUAL',
    headingBottom: 'SPECTRUM',
    description: 'Structured denim meets bold color-block hues. Sculpted precision designed for modern city elegance and effortless cool.',
    image: '/images/lookbook-urban-contrast.jpg',
    bgImage: '/images/lookbook-urban-contrast.jpg',
    slug: 'noir-tailored-suit'
  },
  {
    id: 'ch-3',
    numeral: 'III',
    title: 'Golden Reverie',
    tagline: 'HAUTE COUTURE ARCHIVE',
    headingTop: 'GOLDEN',
    headingBottom: 'SEASONS',
    description: 'Deep warm textures and natural silhouettes crafted for sun-drenched afternoons — where fashion meets the golden hour.',
    image: '/images/lookbook-golden-reverie.jpg',
    bgImage: '/images/lookbook-golden-reverie.jpg',
    slug: 'velvet-evening-gown'
  },
  {
    id: 'ch-4',
    numeral: 'IV',
    title: 'Ethereal Bloom',
    tagline: 'ATELIER EDITION',
    headingTop: 'SUNLIT',
    headingBottom: 'HARMONY',
    description: 'Lightness suspended in perpetual bloom. Delicate lace and woven straw handcrafted for timeless romance and feminine grace.',
    image: '/images/lookbook-ethereal-bloom.jpg',
    bgImage: '/images/lookbook-ethereal-bloom.jpg',
    slug: 'chiffon-resort-gown'
  },
  {
    id: 'ch-5',
    numeral: 'V',
    title: 'Autumn Warmth',
    tagline: 'ELESENE COLLECTION',
    headingTop: 'WARM',
    headingBottom: 'EMBRACE',
    description: 'Rich amber tones and voluminous textures envelop the senses. Autumn luxury redefined for the bold, modern woman.',
    image: '/images/lookbook-autumn-warmth.jpg',
    bgImage: '/images/lookbook-autumn-warmth.jpg',
    slug: 'luxe-satin-dress'
  }
];

const LookbookCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % lookbookSlides.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? lookbookSlides.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  const goToSlide = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const activeSlide = lookbookSlides[currentIndex];

  const bgVariants = {
    enter: { opacity: 0, scale: 1.06 },
    center: { opacity: 0.38, scale: 1, transition: { duration: 1.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.97, transition: { duration: 0.8 } }
  };

  const textVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      filter: 'blur(5px)'
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.55, ease: 'easeOut' },
        filter: { duration: 0.45 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      filter: 'blur(5px)',
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 }
      }
    })
  };

  const imageVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.94,
      rotateY: dir > 0 ? 8 : -8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        opacity: { duration: 0.6 },
        scale: { duration: 0.6, ease: 'easeOut' },
        rotateY: { duration: 0.6, ease: 'easeOut' }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.94,
      rotateY: dir > 0 ? -8 : 8,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        opacity: { duration: 0.4 }
      }
    })
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative bg-[#070707] text-white overflow-hidden py-20 md:py-28 min-h-[720px] flex items-center border-y border-white/10 select-none"
      aria-label="Lookbook Carousel"
    >
      {/* Ambient Background with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${activeSlide.id}`}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img
            src={activeSlide.bgImage}
            alt=""
            className="w-full h-full object-cover brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/80 to-[#070707]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-[#070707]" />
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
        {!isPaused && (
          <motion.div
            key={currentIndex}
            className="h-full bg-[#9E8B6D]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 6, ease: 'linear' }}
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full relative z-10 grid lg:grid-cols-12 gap-10 items-center">

        {/* Left Chapters Sidebar */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-12">
          <div>
            <span className="text-[10px] font-futura tracking-[0.35em] uppercase text-white/40 block mb-6 font-bold">
              CHAPTERS
            </span>
            <div className="space-y-5">
              {lookbookSlides.map((slide, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    className="flex items-center gap-4 text-left group cursor-pointer w-full focus:outline-none"
                    aria-label={`Go to chapter ${slide.numeral}: ${slide.title}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <div className={`w-0.5 h-8 transition-all duration-500 rounded-full ${
                      isActive
                        ? 'bg-[#9E8B6D] shadow-[0_0_10px_rgba(158,139,109,0.8)]'
                        : 'bg-white/10 group-hover:bg-white/30'
                    }`} />
                    <div>
                      <span className={`text-[10px] font-futura tracking-[0.2em] uppercase block transition-colors duration-300 font-bold ${
                        isActive ? 'text-[#9E8B6D]' : 'text-white/40 group-hover:text-white/70'
                      }`}>
                        {slide.numeral}
                      </span>
                      <span className={`text-xs font-futura tracking-wider block transition-colors duration-300 ${
                        isActive ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white/90'
                      }`}>
                        {slide.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2 pt-2">
            {lookbookSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`rounded-full transition-all duration-400 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-1.5 bg-[#9E8B6D]'
                    : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Main Stage */}
        <div className="lg:col-span-9 grid md:grid-cols-12 gap-8 items-center relative min-h-[460px]">

          {/* Text Content */}
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={`text-${activeSlide.id}`}
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="md:col-span-7 flex flex-col justify-center space-y-6 z-10"
            >
              <span className="text-[11px] font-futura uppercase tracking-[0.4em] text-[#9E8B6D] font-bold block">
                {activeSlide.tagline}
              </span>

              <div className="space-y-0 leading-none">
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold uppercase tracking-wider text-white">
                  {activeSlide.headingTop}
                </h2>
                <h2
                  className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold uppercase tracking-wider text-transparent"
                  style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.80)' }}
                >
                  {activeSlide.headingBottom}
                </h2>
              </div>

              <p className="text-white/65 font-light text-xs sm:text-sm leading-relaxed max-w-md">
                {activeSlide.description}
              </p>

              <div className="flex items-center gap-6 pt-2">
                <Link
                  to={`/product/${activeSlide.slug}`}
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full glass-dark border border-white/15 hover:border-[#9E8B6D]/60 hover:bg-[#9E8B6D]/10 text-xs font-futura tracking-[0.2em] uppercase font-bold transition-all duration-300 group cursor-pointer text-white/80 hover:text-[#9E8B6D]"
                >
                  <span>EXPLORE THE STORY</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300 text-[#9E8B6D]">→</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    aria-label="Previous Chapter"
                    className="w-9 h-9 rounded-full glass-dark border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-[#9E8B6D] hover:bg-[#9E8B6D]/15 transition-all duration-300 cursor-pointer"
                  >
                    ←
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Next Chapter"
                    className="w-9 h-9 rounded-full glass-dark border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-[#9E8B6D] hover:bg-[#9E8B6D]/15 transition-all duration-300 cursor-pointer"
                  >
                    →
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Image Card */}
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={`img-${activeSlide.id}`}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="md:col-span-5 relative flex justify-end"
              style={{ perspective: 1000 }}
            >
              <div className="w-full max-w-[340px] md:max-w-none aspect-[3/4] rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative group">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                  <span className="text-[10px] font-futura uppercase tracking-[0.2em] font-bold glass-dark-md px-3 py-1.5 rounded-full border border-white/10">
                    LOOK 0{currentIndex + 1}
                  </span>
                  <span className="text-xs font-display italic text-[#9E8B6D] glass-dark px-2 py-1 rounded-lg border border-white/[0.06]">
                    ELESENE Atelier
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
};

export default LookbookCarousel;
