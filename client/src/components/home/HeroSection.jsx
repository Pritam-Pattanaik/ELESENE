import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';


const heroFeatures = [
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m15.364 6.364l-12.728-12.728m0 12.728L17.364 5.636" />
      </svg>
    ),
    title: 'EXCLUSIVE DESIGNS',
    desc: 'Limited pieces for the connoisseur'
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    title: 'ARTISAN CRAFTED',
    desc: 'Handcrafted in Italian ateliers'
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 3" />
      </svg>
    ),
    title: 'SUSTAINABLE LUXURY',
    desc: 'Ethical materials, timeless impact'
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'PRIVATE EXPERIENCE',
    desc: 'Bespoke service for discerning clients'
  }
];

const HeroSection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMounted, setIsMounted]   = useState(false); // whole-section fade-in on route change
  const [videoReady, setVideoReady] = useState(false); // video fades in once playable (no flash)
  const videoRef = useRef(null);
  const heroRef  = useRef(null);

  // Trigger fade-in on next frame after mount so the section never snaps in
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Pause background video when scrolled out of view to save GPU decoding
  useEffect(() => {
    const video = videoRef.current;
    const hero  = heroRef.current;
    if (!video || !hero) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full bg-noir pt-24 pb-16 flex flex-col justify-between overflow-hidden"
      style={{
        opacity: isMounted ? 1 : 0,
        transition: 'opacity 0.55s ease-out',
        willChange: 'opacity',
      }}
    >
      
      {/* Background Video — fades in only once ready, no image flash */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          fetchPriority="high"
          onCanPlay={() => setVideoReady(true)}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{
            opacity: videoReady ? 0.9 : 0,
            transition: 'opacity 1.2s ease-in-out',
            willChange: 'opacity',
          }}
        >
          <source src="/Woman_walking_on_city_street_202605051557.mp4" type="video/mp4" />
        </video>

        {/* Soft Golden Ivory Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/75 to-transparent pointer-events-none w-full md:w-3/5 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/40 pointer-events-none z-10" />
      </div>

      {/* Main Grid Content */}
      <div className="relative z-20 max-w-[1450px] mx-auto px-4 sm:px-6 md:px-12 w-full my-auto grid lg:grid-cols-12 gap-8 items-center min-h-[560px]">
        
        {/* Left Editorial Copy */}
        <div className="lg:col-span-7 space-y-6 max-w-2xl">
          
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            <span className="text-xs font-futura font-bold tracking-[0.35em] text-ivory/70 uppercase block">
              AUTUMN / WINTER 2026
            </span>
            <div className="w-12 h-[2px] bg-gold" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-display-hero text-ivory font-normal leading-[1.08] tracking-tight uppercase"
          >
            HAUTE COUTURE <br />
            <span className="font-display font-bold text-ivory">REDEFINED</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="space-y-2 pt-2 border-l-2 border-gold pl-4"
          >
            <p className="text-base md:text-lg font-display italic text-ivory/80 font-medium">
              Where structural precision meets fluid elegance.
            </p>
            <p className="text-xs font-futura font-bold tracking-[0.25em] text-ivory/70 uppercase">
              Milan • Paris • Florence Ateliers
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4"
          >
            <Link 
              to="/shop"
              data-cursor="SHOP"
              className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 sm:py-4 bg-ivory text-white hover:bg-gold hover:text-noir rounded-xl text-[11px] sm:text-xs font-futura font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-xl hover:shadow-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span>EXPLORE COLLECTION</span>
              <span>→</span>
            </Link>

            <Link 
              to="/lookbook"
              data-cursor="VIEW"
              className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 sm:py-4 glass-subtle border border-white/25 text-ivory hover:border-gold/50 hover:text-gold rounded-xl text-[11px] sm:text-xs font-futura font-bold tracking-[0.2em] uppercase backdrop-blur-md transition-all duration-300 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span>DISCOVER LOOKBOOK</span>
              <span>📖</span>
            </Link>
          </motion.div>

        </div>

      </div>

      {/* Floating 4-Pillar Bottom Banner */}
      <div className="relative z-20 max-w-[1380px] mx-auto px-4 sm:px-6 w-full mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="glass-card glass-shimmer p-4 sm:p-6 md:p-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/20"
        >
          {heroFeatures.map((feat) => (
            <div key={feat.title} className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4 first:pt-0 first:px-0">
              <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center shrink-0 border border-gold/25">
                {feat.icon}
              </div>
              <div>
                <h4 className="text-xs font-futura font-bold text-ivory tracking-widest uppercase">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-ivory/70 font-futura font-light mt-0.5 leading-snug">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Cinema Fullscreen Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/20 z-10 bg-black"
            >
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Close video modal"
                className="absolute top-4 right-6 text-white hover:text-gold text-3xl font-bold z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                &times;
              </button>
              <video 
                autoPlay 
                controls 
                className="w-full h-full object-cover"
              >
                <source src="/Woman_walking_on_city_street_202605051557.mp4" type="video/mp4" />
              </video>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default HeroSection;
