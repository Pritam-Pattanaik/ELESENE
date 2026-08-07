import { useRef, useEffect, useCallback } from 'react';
import { useScroll, useMotionValueEvent, useInView } from 'framer-motion';
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

// Hoisted outside component — was previously called 4× per scroll pixel inside FeatureCard body
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* ─── Single Feature Card — rendered once, updated via DOM ref (no re-renders) ─── */
const FeatureCard = ({ feature, domRef }) => {
  return (
    <div
      ref={domRef}
      className={`scroll-frame-feature ${feature.side}`}
      style={{ opacity: 0, visibility: 'hidden', transform: 'translate(0px, 10px)' }}
    >
      <span className="scroll-frame-feature-tag">{feature.tag}</span>
      <h3 className="scroll-frame-feature-title">{feature.title}</h3>
      <p className="scroll-frame-feature-desc">{feature.description}</p>
      <div className="scroll-frame-feature-line" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
};

/* ─── Progress indicator dots — updated via DOM refs (no re-renders) ─── */
const ProgressDots = ({ features, dotRefs }) => (
  <div className="scroll-frame-dots">
    {features.map((f, i) => (
      <div
        key={f.id}
        ref={el => { dotRefs.current[i] = el; }}
        className="scroll-frame-dot"
      />
    ))}
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
  const animFrameRef = useRef(null);
  const currentFrameRef = useRef(0);

  // DOM refs for direct style mutation — avoids React re-renders on every scroll event
  const headerRef = useRef(null);
  const scrollHintRef = useRef(null);
  const featureDomRefs = useRef(features.map(() => null));
  const dotRefs = useRef([]);
  const loaderRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const isInView = useInView(containerRef, { once: true, margin: '200% 0px' });

  /* ─── Draw frame on canvas ─── */
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[frameIndex]) return;

    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIndex];

    if (!img.complete || img.naturalWidth === 0) return;

    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  /* ─── Preload all frames ─── */
  useEffect(() => {
    if (!isInView) return;

    let loaded = 0;
    const images = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const num = String(i).padStart(3, '0');
      img.src = `${framePath}${num}.jpg`;
      const onDone = () => {
        loaded++;
        if (loaded === totalFrames) {
          // Hide loader via DOM ref — no setState needed
          if (loaderRef.current) loaderRef.current.style.display = 'none';
          drawFrame(0);
        }
      };
      img.onload = onDone;
      img.onerror = onDone;
      images[i - 1] = img;
    }

    imagesRef.current = images;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFrames, framePath, isInView]);

  /* ─── Update all DOM elements directly on scroll — zero React re-renders ─── */
  const updateDOM = useCallback((progress) => {
    // Header fade-out
    if (headerRef.current) {
      const headerOpacity = progress < 0.06 ? 1 : Math.max(0, 1 - (progress - 0.06) / 0.06);
      headerRef.current.style.opacity = headerOpacity;
    }

    // Scroll hint
    if (scrollHintRef.current) {
      scrollHintRef.current.style.opacity = progress < 0.03 ? '1' : '0';
    }

    // Feature cards
    features.forEach((feature, i) => {
      const el = featureDomRefs.current[i];
      if (!el) return;
      const [start, end] = feature.range;
      const mid = (start + end) / 2;
      const fadeIn  = Math.min(1, Math.max(0, (progress - start) / (mid - start)));
      const fadeOut = Math.min(1, Math.max(0, (end - progress) / (end - mid)));
      const opacity = Math.min(fadeIn, fadeOut);

      if (opacity <= 0.01) {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        return;
      }

      el.style.visibility = 'visible';
      el.style.opacity = opacity;

      const slideDistance = prefersReducedMotion ? 0 : 60;
      const translateX = feature.side === 'left'
        ? -slideDistance + slideDistance * fadeIn
        : slideDistance - slideDistance * fadeIn;
      const translateY = prefersReducedMotion ? 0 : (10 - 10 * fadeIn);
      el.style.transform = `translate(${translateX}px, ${translateY}px)`;

      const lineEl = el.querySelector('.scroll-frame-feature-line');
      if (lineEl) lineEl.style.transform = `scaleX(${opacity})`;
    });

    // Progress dots
    features.forEach((feature, i) => {
      const dot = dotRefs.current[i];
      if (!dot) return;
      const active = progress >= feature.range[0] && progress <= feature.range[1];
      if (active) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }, [features]);

  /* ─── Listen to scroll — update canvas + DOM directly, no setState ─── */
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    updateDOM(latest);

    const frameIndex = Math.min(
      totalFrames - 1,
      Math.floor(latest * (totalFrames - 1))
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
    }
  });

  /* ─── Cleanup ─── */
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <section ref={containerRef} className="scroll-frame-container">
      {/* Sticky viewport */}
      <div className="scroll-frame-sticky">
        {/* Subtle background glow */}
        <div className="scroll-frame-glow" />

        {/* Section header — controlled via DOM ref */}
        <div ref={headerRef} className="scroll-frame-header" style={{ opacity: 1 }}>
          <span className="scroll-frame-header-tag">{tag}</span>
          <h2 className="scroll-frame-header-title">{title}</h2>
        </div>

        {/* Canvas */}
        <div className="scroll-frame-canvas-wrapper" style={{ paddingTop: canvasPaddingTop }}>
          <canvas
            ref={canvasRef}
            className="scroll-frame-canvas"
            style={{ mixBlendMode: blendMode, maxWidth: canvasMaxWidth }}
          />

          {/* Loading state — hidden via DOM ref once frames load */}
          <div ref={loaderRef} className="scroll-frame-loader">
            <div className="scroll-frame-loader-spinner" />
            <span className="scroll-frame-loader-text">Loading experience...</span>
          </div>
        </div>

        {/* Feature cards — each receives a DOM ref, updated without re-rendering */}
        <div className="scroll-frame-features">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              domRef={el => { featureDomRefs.current[i] = el; }}
            />
          ))}
        </div>

        {/* Progress dots */}
        <ProgressDots features={features} dotRefs={dotRefs} />

        {/* Scroll hint — controlled via DOM ref */}
        <div ref={scrollHintRef} className="scroll-frame-scroll-hint" style={{ opacity: 1 }}>
          <div className="scroll-frame-scroll-hint-mouse">
            <div className="scroll-frame-scroll-hint-wheel" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollFrameAnimation;
