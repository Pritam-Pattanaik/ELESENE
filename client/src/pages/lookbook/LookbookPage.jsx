import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ScrollReveal from '../../components/effects/ScrollReveal';
import SEO from '../../components/layout/SEO';

const lookbookChapters = [
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

const LookbookPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % lookbookChapters.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? lookbookChapters.length - 1 : prev - 1));
  }, []);

  // Smooth Auto-Play Carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, 5500);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  const activeChapter = lookbookChapters[currentIndex];

  const goToChapter = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const handleNext = goNext;
  const handlePrev = goPrev;

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 70 : -70,
      opacity: 0,
      filter: 'blur(5px)',
      scale: 0.97
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.55, ease: 'easeOut' },
        scale: { duration: 0.55 },
        filter: { duration: 0.45 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -70 : 70,
      opacity: 0,
      filter: 'blur(5px)',
      scale: 0.97,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.38 }
      }
    })
  };

  const imageCardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 110 : -110,
      opacity: 0,
      scale: 0.93,
      rotateY: dir > 0 ? 10 : -10
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: 'spring', stiffness: 250, damping: 27 },
        opacity: { duration: 0.6 },
        scale: { duration: 0.6, ease: 'easeOut' },
        rotateY: { duration: 0.6, ease: 'easeOut' }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -110 : 110,
      opacity: 0,
      scale: 0.93,
      rotateY: dir > 0 ? -10 : 10,
      transition: {
        x: { type: 'spring', stiffness: 250, damping: 27 },
        opacity: { duration: 0.38 }
      }
    })
  };

  const chapterGridItems = [
    {
      num: 'CHAPTER I',
      title: 'Bohemian Spirit',
      desc: 'A moment of clarity. Defined embroidery meets a new sense of effortless purpose.',
      image: '/images/lookbook-bohemian-spirit.jpg'
    },
    {
      num: 'CHAPTER II',
      title: 'Ethereal Bloom',
      desc: 'As the world quiets, romance becomes your most powerful statement.',
      image: '/images/lookbook-ethereal-bloom.jpg'
    },
    {
      num: 'CHAPTER III',
      title: 'Urban Contrast',
      desc: 'Where denim and dual color blocks move like poetry in motion.',
      image: '/images/lookbook-urban-contrast.jpg'
    }
  ];

  const galleryImages = [
    '/images/lookbook-bohemian-spirit.jpg',
    '/images/lookbook-urban-contrast.jpg',
    '/images/lookbook-golden-reverie.jpg',
    '/images/lookbook-ethereal-bloom.jpg',
    '/images/lookbook-autumn-warmth.jpg'
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1C1C1C] font-body selection:bg-[#9E8B6D]/30 selection:text-white">
      <SEO title="The Art of Form | Lookbook — ELESENE" description="ELESENE 2025 editorial lookbook featuring high-fashion signature collections." />
      <CustomCursor />
      <Navbar />

      {/* SECTION 1: HERO CAMPAIGN STAGE WITH SMOOTH CAROUSEL */}
      <header
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative bg-[#070707] text-white pt-28 pb-20 md:pb-28 overflow-hidden min-h-[740px] flex items-center border-b border-white/10 select-none"
      >
        {/* Full-Bleed Ambient Background Layer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChapter.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <img 
              src={activeChapter.bgImage} 
              alt="Lookbook Background" 
              className="w-full h-full object-cover filter brightness-[0.65] contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-[#070707]" />
          </motion.div>
        </AnimatePresence>

        {/* Smooth Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
          {!isPaused && (
            <motion.div
              key={currentIndex}
              className="h-full bg-[#9E8B6D]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5.5, ease: 'linear' }}
            />
          )}
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full relative z-10 grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Chapters Sidebar (Span 3) */}
          <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-12">
            <div>
              <span className="text-[10px] font-futura tracking-[0.35em] uppercase text-white/40 block mb-6 font-bold">
                CHAPTERS
              </span>

              <div className="space-y-5">
                {lookbookChapters.map((ch, idx) => {
                  const isActive = currentIndex === idx;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => goToChapter(idx)}
                      className="flex items-center gap-4 text-left group cursor-pointer w-full focus:outline-none"
                      aria-label={`Go to chapter ${ch.numeral}: ${ch.title}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <div className={`w-0.5 h-8 transition-all duration-500 rounded-full ${
                        isActive ? 'bg-[#9E8B6D] shadow-[0_0_10px_rgba(158,139,109,0.8)]' : 'bg-white/10 group-hover:bg-white/30'
                      }`} />
                      <div>
                        <span className={`text-[10px] font-futura tracking-[0.2em] uppercase block transition-colors duration-300 font-bold ${
                          isActive ? 'text-[#9E8B6D]' : 'text-white/40 group-hover:text-white/70'
                        }`}>
                          {ch.numeral}
                        </span>
                        <span className={`text-xs font-futura tracking-wider block transition-colors duration-300 ${
                          isActive ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white/90'
                        }`}>
                          {ch.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="pt-4 flex items-center gap-2">
              {lookbookChapters.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToChapter(idx)}
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

          {/* Center & Right Column Stage (Span 9) */}
          <div className="lg:col-span-9 grid md:grid-cols-12 gap-8 items-center relative min-h-[480px]">
            {/* Main Editorial Text Content */}
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={activeChapter.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="md:col-span-7 flex flex-col justify-center space-y-6 z-10"
              >
                {/* Tagline */}
                <span className="text-[11px] font-futura uppercase tracking-[0.4em] text-[#9E8B6D] font-bold block">
                  {activeChapter.tagline}
                </span>

                {/* Dual-Style Editorial Headline */}
                <div className="space-y-0 leading-none">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold uppercase tracking-wider text-white">
                    {activeChapter.headingTop}
                  </h1>
                  <h1 
                    className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold uppercase tracking-wider text-transparent"
                    style={{
                      WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    {activeChapter.headingBottom}
                  </h1>
                </div>

                {/* Subtitle Description */}
                <p className="text-white/75 font-light text-xs sm:text-sm leading-relaxed max-w-md">
                  {activeChapter.description}
                </p>

                {/* Action Button & Navigation Controls */}
                <div className="flex items-center gap-6 pt-2">
                  <Link
                    to={`/product/${activeChapter.slug}`}
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full border border-white/30 bg-white/5 hover:bg-white/10 hover:border-[#9E8B6D] text-xs font-futura tracking-[0.2em] uppercase font-bold transition-all duration-300 group cursor-pointer"
                  >
                    <span>EXPLORE THE STORY</span>
                    <span className="group-hover:translate-x-1.5 transition-transform duration-300 text-[#9E8B6D]">→</span>
                  </Link>

                  {/* Carousel Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      aria-label="Previous Chapter"
                      className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-[#9E8B6D] transition-colors cursor-pointer"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      aria-label="Next Chapter"
                      className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-[#9E8B6D] transition-colors cursor-pointer"
                    >
                      →
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Right Column: Image Card with 3D perspective */}
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={`img-${activeChapter.id}`}
                custom={direction}
                variants={imageCardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="md:col-span-5 relative flex justify-end"
                style={{ perspective: 1000 }}
              >
                <div className="w-full max-w-[340px] md:max-w-none aspect-[3/4] rounded-3xl overflow-hidden border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative group bg-black/20">
                  <img
                    src={activeChapter.image}
                    alt={activeChapter.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                    <span className="text-[10px] font-futura uppercase tracking-[0.2em] font-bold bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                      LOOK 0{currentIndex + 1}
                    </span>
                    <span className="text-xs font-display italic text-[#9E8B6D] bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                      ELESENE Atelier
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </header>

      {/* SECTION 2: THREE CHAPTERS GRID */}
      <section id="chapters-grid" className="py-20 md:py-32 px-6 sm:px-10 lg:px-16 max-w-[1500px] mx-auto">
        <ScrollReveal variant="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {chapterGridItems.map((ch) => (
              <div key={ch.num} className="space-y-6 group flex flex-col justify-between">
                
                {/* Header text */}
                <div className="text-left space-y-2">
                  <span className="text-[9px] font-futura tracking-[0.25em] text-[#9E8B6D] uppercase font-bold">{ch.num}</span>
                  <h3 className="text-2xl font-display font-semibold tracking-wide text-[#1A1A1A]">{ch.title}</h3>
                  <p className="text-xs text-[#666666] font-futura font-light leading-relaxed max-w-xs">{ch.desc}</p>
                </div>

                {/* Aspect image block */}
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-black/5 shadow-md relative bg-[#FAF8F5]">
                  <div className="absolute inset-0 bg-[#0b0b0b]/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={ch.image} 
                    alt={ch.title} 
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Action Link */}
                <div className="text-left pt-2">
                  <Link to="/shop" className="text-[10px] font-futura tracking-[0.2em] uppercase font-bold text-[#9E8B6D] hover:underline inline-flex items-center gap-1.5">
                    DISCOVER <span className="text-xs">→</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 3: FULL WIDTH QUOTE BANNER */}
      <section className="relative min-h-[380px] flex items-center justify-center bg-[#070707] overflow-hidden px-8 py-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 select-none pointer-events-none filter brightness-75"
          style={{ backgroundImage: `url('/images/lookbook-golden-reverie.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/30 via-transparent to-[#070707]/30 pointer-events-none" />

        <ScrollReveal variant="fade-up">
          <div className="max-w-2xl mx-auto space-y-5 text-center relative z-10 text-white">
            <blockquote className="text-2xl sm:text-3xl font-display font-light italic leading-relaxed tracking-wide">
              &ldquo;Elegance is not about being noticed,<br />
              it&apos;s about being remembered.&rdquo;
            </blockquote>
            <cite className="text-[9px] font-futura tracking-[0.4em] uppercase text-[#9E8B6D] font-bold block not-italic pt-2">
              ELESENE
            </cite>
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 4: EDITORIAL GALLERY */}
      <section className="py-20 md:py-32 px-6 sm:px-10 lg:px-16 border-t border-black/5 max-w-[1500px] mx-auto">
        <ScrollReveal variant="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
            {/* Header text */}
            <div className="lg:col-span-8 text-left space-y-2">
              <span className="text-[9px] font-futura tracking-[0.25em] text-[#9E8B6D] uppercase font-bold">EDITORIAL GALLERY</span>
              <h3 className="text-2xl font-display font-semibold tracking-wide text-[#1A1A1A]">Moments captured in light and shadow.</h3>
            </div>
            
            {/* Button */}
            <div className="lg:col-span-4 lg:text-right text-left">
              <Link to="/shop" className="text-[10px] font-futura tracking-[0.2em] uppercase font-bold text-[#9E8B6D] hover:underline inline-flex items-center gap-1.5">
                VIEW GALLERY <span className="text-xs">→</span>
              </Link>
            </div>
          </div>

          {/* Grid of 5 images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {galleryImages.map((url, idx) => (
              <div key={idx} className="aspect-[3/4] overflow-hidden rounded-2xl border border-black/5 shadow-sm group bg-[#FAF8F5]">
                <img 
                  src={url} 
                  alt={`Editorial look ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default LookbookPage;
