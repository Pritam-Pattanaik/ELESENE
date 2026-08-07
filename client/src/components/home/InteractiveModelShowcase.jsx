import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ScrollReveal from '../effects/ScrollReveal';

const model1Features = [
  { id: 1, title: 'Crafted Silhouettes', tag: 'Design Philosophy', desc: 'Precision tailoring that sculpts the body with fluid grace.' },
  { id: 2, title: 'Gradient Artistry', tag: 'Colour Science', desc: 'Hand-dyed ombré transitions shifting seamlessly with light.' },
  { id: 3, title: 'Premium Fabrics', tag: 'Materials', desc: '100% Mulberry silk and merino wool from Italian mills.' },
  { id: 4, title: 'Statement Accessories', tag: 'Finishing Touch', desc: 'Architectural mini bags with 24k gold electroplated hardware.' },
];

const model2Features = [
  { id: 1, title: 'Runway Statement', tag: 'The Next Chapter', desc: 'Bold modern proportions cut for high-fashion impact.' },
  { id: 2, title: 'Structural Draping', tag: 'Atelier Couture', desc: '3D ergonomic draping engineered in Paris.' },
  { id: 3, title: 'Tailored Precision', tag: 'Craftsmanship', desc: 'Hand-burnished horn buttons and satin French seams.' },
  { id: 4, title: 'Modern Elegance', tag: 'Heritage', desc: 'Timeless luxury for the discerning global wardrobe.' },
];

const ModelCard = ({ 
  title, 
  tag, 
  totalFrames, 
  framePath, 
  features,
  slug = 'silk-slip-dress',
  blendMode = 'multiply' 
}) => {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const currentFrameRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastFeatureIdxRef = useRef(0);

  // Preload frames in idle chunks to prevent main-thread freezing
  useEffect(() => {
    let active = true;
    let loaded = 0;
    const images = [];

    const loadBatch = (startIndex) => {
      if (!active) return;
      const batchSize = 10;
      const endIndex = Math.min(startIndex + batchSize, totalFrames);

      for (let i = startIndex + 1; i <= endIndex; i++) {
        const img = new Image();
        const num = String(i).padStart(3, '0');
        img.src = `${framePath}${num}.jpg`;
        img.onload = img.onerror = () => {
          if (!active) return;
          loaded++;
          if (loaded >= totalFrames) setImagesLoaded(true);
        };
        images[i - 1] = img;
      }

      if (endIndex < totalFrames) {
        setTimeout(() => loadBatch(endIndex), 30);
      }
    };

    loadBatch(0);
    imagesRef.current = images;
    return () => { active = false; };
  }, [totalFrames, framePath]);

  // High-performance direct canvas draw (No React state re-render needed!)
  const renderCanvasFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[currentFrameRef.current]) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[currentFrameRef.current];

    if (!img.complete || img.naturalWidth === 0) return;

    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  // Draw initial frame once loaded
  useEffect(() => {
    if (imagesLoaded) {
      renderCanvasFrame();
    }
  }, [imagesLoaded, renderCanvasFrame]);

  // Gentle auto-drift loop when not hovering (respects prefers-reduced-motion)
  useEffect(() => {
    if (isHovered || !imagesLoaded) return;
    const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const interval = setInterval(() => {
      currentFrameRef.current = (currentFrameRef.current + 1) % totalFrames;
      renderCanvasFrame();

      const featIdx = Math.floor((currentFrameRef.current / totalFrames) * features.length);
      if (featIdx !== lastFeatureIdxRef.current) {
        lastFeatureIdxRef.current = featIdx;
        setActiveFeature(featIdx);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isHovered, imagesLoaded, totalFrames, features.length, renderCanvasFrame]);

  // High-performance horizontal mouse move scrubbing with 0 React re-renders!
  const handleMouseMove = (e) => {
    if (!cardRef.current || !imagesLoaded) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const progress = x / rect.width;
    const frameIndex = Math.min(totalFrames - 1, Math.floor(progress * (totalFrames - 1)));
    
    if (currentFrameRef.current !== frameIndex) {
      currentFrameRef.current = frameIndex;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(renderCanvasFrame);

      const featIdx = Math.min(features.length - 1, Math.floor(progress * features.length));
      if (featIdx !== lastFeatureIdxRef.current) {
        lastFeatureIdxRef.current = featIdx;
        setActiveFeature(featIdx);
      }
    }
  };

  const progressBarRef = useRef(null);

  // Update progress bar width directly on DOM
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${((currentFrameRef.current + 1) / totalFrames) * 100}%`;
    }
  });

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="glass-card glass-shimmer p-6 md:p-8 shadow-xl hover:shadow-2xl hover:border-gold/40 transition-all duration-500 flex flex-col justify-between relative overflow-hidden group cursor-crosshair"
    >
      {/* Top Header info */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <span className="text-[9px] font-futura tracking-[0.3em] uppercase text-gold-light font-bold block mb-1">
            {tag}
          </span>
          <Link to={`/product/${slug}`} className="hover:text-gold transition-colors block">
            <h3 className="text-h3 text-ivory font-bold uppercase hover:text-gold transition-colors">
              {title}
            </h3>
          </Link>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] font-futura font-bold text-ivory/70 uppercase tracking-widest glass-subtle px-3 py-1 rounded-full border border-black/5">
            {isHovered ? 'Interactive Scrub' : 'Auto Motion'}
          </span>
          <Link 
            to={`/product/${slug}`} 
            className="text-[9px] font-futura font-bold tracking-[0.2em] uppercase text-gold hover:text-noir hover:bg-gold glass-gold border border-gold/30 px-3 py-1 rounded-full transition-all duration-300 z-20"
          >
            EXPLORE DESIGN →
          </Link>
        </div>
      </div>

      {/* Frame Canvas Wrapper */}
      <div className="relative w-full aspect-[4/5] max-h-[420px] my-4 flex items-center justify-center rounded-2xl bg-noir border border-black/5 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          style={{ mixBlendMode: blendMode }}
        />

        {!imagesLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-[10px] font-futura font-bold tracking-widest text-ivory/70 uppercase">Loading Atelier Keyframes...</span>
          </div>
        )}

        {/* Hover guidance badge & link */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/10 shadow-sm z-20">
          <span className="text-[9px] font-futura font-bold tracking-widest text-ivory uppercase flex items-center gap-2">
            <span>↔</span>
            <span>Move cursor to scrub</span>
          </span>
          <span className="text-black/20">|</span>
          <Link to={`/product/${slug}`} className="text-[9px] font-futura font-bold tracking-widest text-gold hover:underline uppercase">
            View Piece →
          </Link>
        </div>
      </div>

      {/* Active Feature Detail Reveal Card */}
      <div className="relative z-10 pt-2 border-t border-black/5 min-h-[90px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-futura font-bold tracking-widest text-gold-light uppercase bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                {features[activeFeature].tag}
              </span>
              <h4 className="text-h4 font-bold text-ivory">
                {features[activeFeature].title}
              </h4>
            </div>
            <p className="text-xs font-body text-ivory/70 font-light leading-relaxed">
              {features[activeFeature].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Frame Progress Bar */}
      <div className="w-full h-1 bg-black/5 rounded-full mt-4 overflow-hidden">
        <div 
          ref={progressBarRef}
          className="h-full bg-gold transition-all duration-150 rounded-full"
          style={{ width: '0%' }}
        />
      </div>

    </div>
  );
};

const InteractiveModelShowcase = () => {
  return (
    <section className="relative py-28 md:py-36 bg-noir border-y border-black/5 overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-deep-purple via-lavender-light to-ice-blue rounded-full blur-[140px] pointer-events-none opacity-80" />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 md:px-16 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-futura tracking-[0.4em] uppercase text-gold-light font-bold block mb-3">
            INTERACTIVE RUNWAY SHOWCASE
          </span>
          <h2 className="text-h2 text-ivory uppercase tracking-wide">
            Couture In <span className="italic text-gold">Motion</span>
          </h2>
          <p className="text-ivory/70 text-xs md:text-sm font-body font-light mt-3 leading-relaxed">
            Move your cursor across either model card to scrub through high-resolution atelier keyframes in real time.
          </p>
        </ScrollReveal>

        {/* Side-by-Side Dual Model Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ScrollReveal variant="fade-up" delay={0.1}>
            <ModelCard 
              title="Crafted Silhouettes"
              subtitle="Model 01"
              tag="MODEL 01 • ATELIER COUTURE"
              totalFrames={240}
              framePath="/video_1_frames/ezgif-frame-"
              features={model1Features}
              slug="silk-slip-dress"
            />
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.25}>
            <ModelCard 
              title="The Next Chapter"
              subtitle="Model 02"
              tag="MODEL 02 • RUNWAY EDIT"
              totalFrames={154}
              framePath="/Video_2_Frames/ezgif-frame-"
              features={model2Features}
              slug="noir-tailored-suit"
            />
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
};

export default InteractiveModelShowcase;
