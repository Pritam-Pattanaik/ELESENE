import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useMotionValueEvent, useInView } from 'framer-motion';
import './ScrollFrameAnimation.css';

/* ─── Default Feature data ─── */
const defaultFeatures = [
  {
    id: 1,
    title: 'Crafted Silhouettes',
    description: 'Every curve is intentional. Our designs sculpt the body with precision tailoring that moves with you — never against.',
    tag: 'Design Philosophy',
    range: [0.08, 0.25],
    side: 'left',
  },
  {
    id: 2,
    title: 'Gradient Artistry',
    description: 'Hand-dyed ombré techniques create seamless colour transitions that shift with light, making each piece uniquely alive.',
    tag: 'Colour Science',
    range: [0.28, 0.45],
    side: 'right',
  },
  {
    id: 3,
    title: 'Premium Fabrics',
    description: 'Sourced from the finest mills in Italy and Japan — silk charmeuse, crepe, and micro-twill that drape like liquid.',
    tag: 'Materials',
    range: [0.48, 0.65],
    side: 'left',
  },
  {
    id: 4,
    title: 'Statement Accessories',
    description: 'Architectural mini bags and sculpted hardware complete the look. Each accessory is a design object in its own right.',
    tag: 'Finishing Touch',
    range: [0.68, 0.85],
    side: 'right',
  },
];

/* ─── Single Feature Card ─── */
const FeatureCard = ({ feature, progress }) => {
  const [start, end] = feature.range;
  const mid = (start + end) / 2;

  // Fade in from start to midpoint, fade out from midpoint to end
  const fadeIn = Math.min(1, Math.max(0, (progress - start) / (mid - start)));
  const fadeOut = Math.min(1, Math.max(0, (end - progress) / (end - mid)));
  const opacity = Math.min(fadeIn, fadeOut);

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Slide from offset to 0
  const slideDistance = prefersReducedMotion ? 0 : 60;
  const translateX = feature.side === 'left'
    ? -slideDistance + slideDistance * fadeIn
    : slideDistance - slideDistance * fadeIn;

  const translateY = prefersReducedMotion ? 0 : (10 - 10 * fadeIn);

  if (opacity <= 0.01) return null;

  return (
    <div
      className={`scroll-frame-feature ${feature.side}`}
      style={{
        opacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
      }}
    >
      <span className="scroll-frame-feature-tag">{feature.tag}</span>
      <h3 className="scroll-frame-feature-title">{feature.title}</h3>
      <p className="scroll-frame-feature-desc">{feature.description}</p>
      <div className="scroll-frame-feature-line" style={{ transform: `scaleX(${opacity})` }} />
    </div>
  );
};

/* ─── Progress indicator dots ─── */
const ProgressDots = ({ progress, features }) => (
  <div className="scroll-frame-dots">
    {features.map((f) => {
      const active = progress >= f.range[0] && progress <= f.range[1];
      return (
        <div
          key={f.id}
          className={`scroll-frame-dot ${active ? 'active' : ''}`}
        />
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const ScrollFrameAnimation = ({
  totalFrames = 240,
  framePath = '/video_1_frames/ezgif-frame-',
  features = defaultFeatures,
  tag = 'The Experience',
  title = 'Scroll to Explore',
  blendMode = 'multiply',
  canvasMaxWidth = '40vw',
  canvasPaddingTop = '9vh'
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const animFrameRef = useRef(null);
  const currentFrameRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const isInView = useInView(containerRef, { once: true, margin: '200% 0px' });

  /* ─── Preload all frames ─── */
  useEffect(() => {
    if (!isInView) return;

    let loaded = 0;
    const images = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const num = String(i).padStart(3, '0');
      img.src = `${framePath}${num}.jpg`;
      img.onload = () => {
        loaded++;
        if (loaded === totalFrames) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === totalFrames) {
          setImagesLoaded(true);
        }
      };
      images[i - 1] = img;
    }

    imagesRef.current = images;
  }, [totalFrames, framePath, isInView]);

  /* ─── Draw frame on canvas ─── */
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[frameIndex]) return;

    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIndex];

    if (!img.complete || img.naturalWidth === 0) return;

    // Set canvas dimensions to match image on first draw
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  /* ─── Listen to scroll and update frame ─── */
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setCurrentProgress(latest);

    const frameIndex = Math.min(
      totalFrames - 1,
      Math.floor(latest * (totalFrames - 1))
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      animFrameRef.current = requestAnimationFrame(() => {
        drawFrame(frameIndex);
      });
    }
  });

  /* ─── Draw first frame once loaded ─── */
  useEffect(() => {
    if (imagesLoaded) {
      drawFrame(0);
    }
  }, [imagesLoaded, drawFrame]);

  /* ─── Cleanup ─── */
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <section ref={containerRef} className="scroll-frame-container">
      {/* Sticky viewport */}
      <div className="scroll-frame-sticky">
        {/* Subtle background glow */}
        <div className="scroll-frame-glow" />

        {/* Section header — visible at the start */}
        <motion.div
          className="scroll-frame-header"
          style={{
            opacity: currentProgress < 0.06 ? 1 : Math.max(0, 1 - (currentProgress - 0.06) / 0.06),
          }}
        >
          <span className="scroll-frame-header-tag">{tag}</span>
          <h2 className="scroll-frame-header-title">{title}</h2>
        </motion.div>

        {/* Canvas */}
        <div className="scroll-frame-canvas-wrapper" style={{ paddingTop: canvasPaddingTop }}>
          <canvas
            ref={canvasRef}
            className="scroll-frame-canvas"
            style={{ mixBlendMode: blendMode, maxWidth: canvasMaxWidth }}
          />

          {/* Loading state */}
          {!imagesLoaded && (
            <div className="scroll-frame-loader">
              <div className="scroll-frame-loader-spinner" />
              <span className="scroll-frame-loader-text">Loading experience...</span>
            </div>
          )}
        </div>

        {/* Feature cards */}
        <div className="scroll-frame-features">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              progress={currentProgress}
            />
          ))}
        </div>

        {/* Progress dots */}
        <ProgressDots progress={currentProgress} features={features} />

        {/* Scroll hint at bottom */}
        <motion.div
          className="scroll-frame-scroll-hint"
          style={{
            opacity: currentProgress < 0.03 ? 1 : 0,
          }}
        >
          <div className="scroll-frame-scroll-hint-mouse">
            <div className="scroll-frame-scroll-hint-wheel" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScrollFrameAnimation;
