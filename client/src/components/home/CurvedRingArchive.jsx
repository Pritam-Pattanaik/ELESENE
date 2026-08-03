import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useCustomerAuthStore from "../../store/customerAuthStore";
import gsap from "gsap";

// Import images from assets folder
import dress from "../../assets/archive/fashion-dress.jpg";
import coat from "../../assets/archive/fashion-coat.jpg";
import bag from "../../assets/archive/fashion-bag.jpg";
import trousers from "../../assets/archive/fashion-trousers.jpg";
import jewelry from "../../assets/archive/fashion-jewelry.jpg";
import boots from "../../assets/archive/fashion-boots.jpg";
import knit from "../../assets/archive/fashion-knit.jpg";
import loungewear from "../../assets/archive/fashion-loungewear.jpg";
import slip from "../../assets/archive/fashion-slip.jpg";
import denim from "../../assets/archive/fashion-denim.jpg";
import skirt from "../../assets/archive/fashion-skirt.jpg";
import sundress from "../../assets/archive/fashion-sundress.jpg";
import suit from "../../assets/archive/fashion-suit.jpg";
import hat from "../../assets/archive/fashion-hat.jpg";
import athleisure from "../../assets/archive/fashion-athleisure.jpg";
import gown from "../../assets/archive/fashion-gown.jpg";
import cardigan from "../../assets/archive/fashion-cardigan.jpg";
import sneakers from "../../assets/archive/fashion-sneakers.jpg";

// resolved asset URL. Keys match the `file` field on PROJECTS.
const IMAGE_MAP = {
  "silk-midi-dress.webp": dress,
  "wool-tailored-coat.webp": coat,
  "leather-tote-bag.webp": bag,
  "wide-leg-trousers.webp": trousers,
  "gold-chain-necklace.webp": jewelry,
  "suede-ankle-boots.webp": boots,
  "ribbed-knit-dress.webp": knit,
  "silk-pajama-set.webp": loungewear,
  "black-satin-slip.webp": slip,
  "denim-jacket-set.webp": denim,
  "red-pleated-skirt.webp": skirt,
  "floral-sundress.webp": sundress,
  "charcoal-pantsuit.webp": suit,
  "straw-sun-hat.webp": hat,
  "sage-athleisure-set.webp": athleisure,
  "emerald-velvet-gown.webp": gown,
  "oversized-cardigan.webp": cardigan,
  "white-leather-sneakers.webp": sneakers,
};

// Inlined theme helper functions
const DEFAULT_THEME = "light";
const DEFAULT_ACCENT = "neutral";

const surfaceTokens = (theme) => {
  if (theme === "dark") {
    return {
      bg: "#1C1C1C",
      surface: "#282825",
      surfaceElevated: "#33332F",
      border: "rgba(255,255,255,0.10)",
      text: "#F2F1EC",
      textSecondary: "rgba(242,241,236,0.78)",
      textMuted: "rgba(242,241,236,0.55)",
    };
  }
  return {
    bg: "#FAF9F6", // Matches brand color-cream / color-noir
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "rgba(28,28,28,0.10)",
    text: "#1C1C1C",
    textSecondary: "rgba(28,28,28,0.72)",
    textMuted: "rgba(28,28,28,0.50)",
  };
};

const ACCENT_HEX = {
  blue: { light: "#0093FF", dark: "#3AA8FF" },
  green: { light: "#22C55E", dark: "#34D27A" },
  orange: { light: "#F97316", dark: "#FB8A3C" },
  pink: { light: "#EC4899", dark: "#F06BAF" },
  violet: { light: "#8B5CF6", dark: "#A587F9" },
  neutral: { light: "#C9A84C", dark: "#C9A84C" }, // Use Gold for Neutral accent in Elesene brand context
};

const resolvedAccentHex = (accent, theme) => {
  return ACCENT_HEX[accent]?.[theme] || ACCENT_HEX.neutral[theme];
};

// --- DATA (women's fashion catalog) ---
const IMG = (file) => IMAGE_MAP[file] ?? IMAGE_MAP["silk-midi-dress.webp"];

const PROJECTS = [
  { title: "Aria Silk Midi Dress", category: "Dresses", year: "SS26", model: "Elena", price: 289, desc: "A weightless silk midi with a fluid bias cut and a whisper-soft ivory finish — made for warm evenings and long dinners.", file: "silk-midi-dress.webp" },
  { title: "Camel Wool Coat", category: "Outerwear", year: "AW25", model: "Mira", price: 495, desc: "A tailored double-face wool coat cut long and lean, with hand-finished lapels and a single horn button closure.", file: "wool-tailored-coat.webp" },
  { title: "Sienna Leather Tote", category: "Bags", year: "SS26", model: "Noor", price: 340, desc: "Full-grain vegetable-tanned leather, unlined and softly slouchy — an everyday tote that ages beautifully.", file: "leather-tote-bag.webp" },
  { title: "Wide-Leg Linen Trousers", category: "Bottoms", year: "SS26", model: "Ines", price: 178, desc: "Fluid high-waist trousers in warm honey linen — pleated front, generous leg, effortless drape.", file: "wide-leg-trousers.webp" },
  { title: "Layered Gold Necklace", category: "Jewelry", year: "SS26", model: "Amelia", price: 145, desc: "A featherlight two-layer chain in recycled 18k gold-plated brass with a hand-finished pendant.", file: "gold-chain-necklace.webp" },
  { title: "Camel Suede Ankle Boot", category: "Shoes", year: "AW25", model: "Sofia", price: 268, desc: "Italian suede ankle boot on a stacked leather heel — refined, sturdy, made to walk in.", file: "suede-ankle-boots.webp" },
  { title: "Ribbed Knit Column Dress", category: "Knitwear", year: "AW25", model: "Livia", price: 224, desc: "A slim ribbed column dress in soft merino blend — sculptural yet quiet, layers effortlessly.", file: "ribbed-knit-dress.webp" },
  { title: "Blush Silk Pajama Set", category: "Loungewear", year: "SS26", model: "Rosa", price: 198, desc: "Sand-washed silk pajamas in a soft blush — piped collar, tie waist, made for slow mornings.", file: "silk-pajama-set.webp" },
  { title: "Noir Satin Slip Dress", category: "Dresses", year: "AW25", model: "Céleste", price: 312, desc: "Bias-cut black satin slip with a low back and thin straps — sculptural drape, evening-ready.", file: "black-satin-slip.webp" },
  { title: "Cropped Denim Jacket", category: "Denim", year: "SS26", model: "Juno", price: 168, desc: "A boxy cropped denim jacket in washed indigo — vintage-inspired fit, softened seams.", file: "denim-jacket-set.webp" },
  { title: "Scarlet Pleated Skirt", category: "Bottoms", year: "AW25", model: "Talia", price: 232, desc: "A fluid pleated maxi skirt in deep scarlet — pairs with everything, moves like water.", file: "red-pleated-skirt.webp" },
  { title: "Rosé Floral Sundress", category: "Dresses", year: "SS26", model: "Isla", price: 195, desc: "A romantic floral sundress in warm rose — bias straps, easy shape, made for the shore.", file: "floral-sundress.webp" },
  { title: "Onyx Wool Pantsuit", category: "Suiting", year: "AW25", model: "Vera", price: 685, desc: "A precisely tailored two-piece in fine Italian wool — hand-set shoulder, straight leg.", file: "charcoal-pantsuit.webp" },
  { title: "Wide-Brim Straw Hat", category: "Accessories", year: "SS26", model: "Mila", price: 118, desc: "A hand-woven Panama straw hat with a soft grosgrain band — a summer essential.", file: "straw-sun-hat.webp" },
  { title: "Sage Movement Set", category: "Activewear", year: "SS26", model: "Kaia", price: 156, desc: "Second-skin sports bra and high-rise leggings in a soft sage tone — sculpted for movement.", file: "sage-athleisure-set.webp" },
  { title: "Emerald Velvet Gown", category: "Evening", year: "AW25", model: "Beatrix", price: 890, desc: "A floor-sweeping strapless gown in deep emerald velvet — corseted bodice, statement occasion.", file: "emerald-velvet-gown.webp" },
  { title: "Cloud Oversized Cardigan", category: "Knitwear", year: "AW25", model: "Anaïs", price: 258, desc: "An oversized cocoon cardigan in soft cream cashmere-blend — the definitive throw-on layer.", file: "oversized-cardigan.webp" },
  { title: "Ivory Leather Sneakers", category: "Shoes", year: "SS26", model: "Freya", price: 210, desc: "Minimal ivory leather sneakers on a cushioned sole — clean lines, dressed-up or down.", file: "white-leather-sneakers.webp" },
].map((p, i) => ({ ...p, id: `cra-${i}`, image: IMG(p.file) }));

// --- CONSTANTS ---
const SEGMENTS = 4;

const DEFAULT_SETTINGS = {
  perRow: 22,
  rows: 2,
  ringSize: 850,
  rowSpacing: 168,
  stack: 210,
  tileScale: 1,
  bend: 18,
  perspective: 2200,
  tilt: -9,
  zoom: 0.55,
  shadow: 0,
};

const INTRO_START_RADIUS = 250;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const mapRange = (v, inMin, inMax, outMin, outMax) =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
const nearestRotation = (current, target) =>
  target + Math.round((current - target) / 360) * 360;

const EXPAND_CONTAINER_MAX = 1500;
const EXPAND_PANEL_W = 420;
const EXPAND_GAP = 40;

function computeHeroRect(rootRect, aspect, isMobile) {
  const pad = isMobile ? 20 : 32;
  const containerW = Math.min(rootRect.width - pad * 2, EXPAND_CONTAINER_MAX);
  const containerX = (rootRect.width - containerW) / 2;

  if (isMobile) {
    const w = containerW;
    const h = Math.min(w / aspect, (rootRect.height - pad * 2) * 0.4);
    return { x: containerX, y: pad, w, h };
  }

  const heroMaxW = containerW - EXPAND_PANEL_W - EXPAND_GAP;
  const heroMaxH = rootRect.height - pad * 2;
  let w = heroMaxW;
  let h = w / aspect;
  if (h > heroMaxH) {
    h = heroMaxH;
    w = h * aspect;
  }
  return {
    x: containerX,
    y: (rootRect.height - h) / 2,
    w,
    h,
  };
}

const prng = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

function buildTiles(s) {
  const anglePer = 360 / s.perRow;

  const tiles = [];
  let n = 0;
  for (let r = 0; r < s.rows; r++) {
    for (let c = 0; c < s.perRow; c++) {
      const seed = n + 1;
      const width = Math.round((160 + prng(seed * 1.7) * 150) * s.tileScale);
      const ratio = 0.6 + prng(seed * 2.3) * 0.85;
      const height = Math.round(width * ratio);
      const angle =
        c * anglePer +
        (r % 2) * (anglePer / 2) +
        (prng(seed * 3.1) - 0.5) * anglePer * 0.55;
      const rowY =
        (r - (s.rows - 1) / 2) * s.rowSpacing + (prng(seed * 4.9) - 0.5) * 120;
      const radius = s.ringSize + (prng(seed * 5.7) - 0.5) * s.stack;
      let projectIndex = Math.floor(prng(seed * 8.31 + r * 17.3 + c * 3.77) * PROJECTS.length);
      if (n > 0 && projectIndex === tiles[n - 1]?.projectIndex) {
        projectIndex = (projectIndex + 1 + Math.floor(prng(seed * 2.17) * (PROJECTS.length - 1))) % PROJECTS.length;
      }
      const focalX = prng(seed * 6.21);
      const focalY = prng(seed * 7.43);
      const arcDeg = (width / radius) * (180 / Math.PI);
      const bend = arcDeg * (s.bend / anglePer);
      tiles.push({
        key: `t-${r}-${c}`,
        project: PROJECTS[projectIndex],
        projectIndex,
        angle,
        rowY,
        radius,
        width,
        height,
        bend,
        focalX,
        focalY,
      });
      n++;
    }
  }
  return { tiles, anglePer };
}

function CurvedSurface({ width, height, image, bend, focalX, focalY, lit }) {
  const segAngle = bend / SEGMENTS;
  const segW = width / SEGMENTS;
  const radius = segW / 2 / Math.tan((segAngle * Math.PI) / 180 / 2);
  const mid = (SEGMENTS - 1) / 2;
  const objPos = `${Math.round(focalX * 100)}% ${Math.round(focalY * 100)}%`;

  return (
    <div
      className="absolute inset-0"
      style={{ transformStyle: "preserve-3d", transform: `translateZ(${-radius}px)` }}
    >
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const angle = (i - mid) * segAngle;
        return (
          <div
            key={i}
            className="absolute top-0 overflow-hidden"
            style={{
              left: "50%",
              width: segW + 0.5,
              height,
              marginLeft: -(segW + 0.5) / 2,
              transformOrigin: "center center",
              transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
              backfaceVisibility: "visible",
            }}
          >
            <img
              data-curve-seg
              src={image}
              alt=""
              draggable={false}
              decoding="async"
              style={{
                width,
                height,
                maxWidth: "none",
                objectFit: "cover",
                objectPosition: objPos,
                marginLeft: -i * segW,
                display: "block",
                opacity: lit ? 1 : 0,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function RingLoader({ onComplete, stroke, bg }) {
  const cylRef = useRef(null);
  const PANELS = 18;
  const RADIUS = 74;

  useLayoutEffect(() => {
    let finished = false;
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray("[data-loader-stroke]");
      gsap.set(cylRef.current, { rotationY: 0, scaleX: 1.45, scaleZ: 1.45 });
      gsap.to(cylRef.current, {
        rotationY: 360,
        scaleX: 1,
        scaleZ: 1,
        duration: 2.4,
        ease: "power2.inOut",
      });
      gsap.fromTo(
        panels,
        { borderWidth: 7, opacity: 1 },
        {
          borderWidth: 0,
          opacity: 0.12,
          duration: 2.4,
          ease: "power2.inOut",
          stagger: { each: 0.035, from: "center" },
        }
      );
      gsap.delayedCall(2.55, () => {
        if (finished) return;
        finished = true;
        onComplete();
      });
    });
    return () => {
      finished = true;
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      <div
        className="flex items-center justify-center"
        style={{ perspective: 720, width: 220, height: 220 }}
      >
        <div
          ref={cylRef}
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(-14deg)" }}
        >
          {Array.from({ length: PANELS }).map((_, i) => {
            const angle = (360 / PANELS) * i;
            return (
              <div
                key={i}
                data-loader-stroke
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 50,
                  height: 104,
                  marginLeft: -25,
                  marginTop: -52,
                  border: `7px solid ${stroke}`,
                  borderRadius: 3,
                  boxSizing: "border-box",
                  background: "transparent",
                  transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                  transformStyle: "preserve-3d",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CurvedRingArchive({
  theme = DEFAULT_THEME,
  accent = DEFAULT_ACCENT,
  embedded = false,
}) {
  const t = surfaceTokens(theme);
  const ac = resolvedAccentHex(accent, theme);
  const isDark = theme === "dark";

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const { tiles } = useMemo(
    () => buildTiles(settings),
    [settings]
  );

  const rootRef = useRef(null);
  const wrapperRef = useRef(null);
  const ringRef = useRef(null);
  const bgRefs = useRef([]);
  const cardsRef = useRef([]);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const detailPanelRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useCustomerAuthStore();

  const [active, setActive] = useState(null);
  const [phase, setPhase] = useState("loader");
  const [introLit, setIntroLit] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const addToCart = (project) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location.pathname, message: 'Please sign in or register to add items to your bag.' } });
      return;
    }
    setCartCount((n) => n + 1);
    setToast(`Added "${project.title}" to cart`);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };
  const zoom = settings.zoom;
  const loaderStroke = isDark ? "#F2F2F2" : "#1C1C1C";

  const physics = useRef({
    rotation: -360,
    targetRotation: -360,
    velocity: 0,
    tilt: DEFAULT_SETTINGS.tilt,
    targetTilt: DEFAULT_SETTINGS.tilt,
    velocityTilt: 0,
    isDown: false,
    lastX: 0,
    lastY: 0,
    dim: 0,
    introRadiusMul: INTRO_START_RADIUS / DEFAULT_SETTINGS.ringSize,
    introRadiusBaked: false,
  });

  const expandTl = useRef(null);
  const expandMetaRef = useRef(null);
  const closingRef = useRef(false);
  const introTweens = useRef({});
  const introFinishedRef = useRef(false);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const resetExpandCard = () => {
    const meta = expandMetaRef.current;
    if (!meta) return;
    gsap.set(meta.hero, { clearProps: "all" });
    meta.hero.style.opacity = "0";
    meta.card.style.zIndex = "";
    meta.card.style.opacity = "1";
    meta.card.style.filter = "none";
    expandMetaRef.current = null;
  };

  const interruptIntroRotation = () => {
    introTweens.current.rot?.kill();
    introTweens.current.rot = undefined;
  };

  useEffect(() => {
    physics.current.targetTilt = settings.tilt;
  }, [settings.tilt]);

  useEffect(() => {
    cardsRef.current.length = tiles.length;
  }, [tiles]);

  useEffect(() => {
    if (!physics.current.introRadiusBaked) return;
    cardsRef.current.forEach((card, i) => {
      const tile = tiles[i];
      if (!card || !tile) return;
      card.style.transform = `rotateY(${tile.angle}deg) translateZ(${tile.radius}px) translateY(${tile.rowY}px)`;
    });
  }, [tiles]);

  useLayoutEffect(() => {
    if (phase !== "intro") return;

    introFinishedRef.current = false;
    requestAnimationFrame(() => setIntroLit(false));
    const p = physics.current;
    p.rotation = -360;
    p.targetRotation = -360;
    p.velocity = 0;
    p.introRadiusMul = INTRO_START_RADIUS / settings.ringSize;
    p.introRadiusBaked = false;

    cardsRef.current.forEach((card) => {
      card?.querySelectorAll("[data-curve-seg]").forEach((seg) => {
        seg.style.opacity = "0";
      });
    });

    let ctx;
    let frame = 0;
    const ROT_DURATION = 2.8;

    const runIntro = () => {
      const cards = cardsRef.current.filter(Boolean);
      const segCount = cards.reduce(
        (n, c) => n + c.querySelectorAll("[data-curve-seg]").length,
        0
      );

      if (segCount < cards.length * SEGMENTS && cards.length > 0) {
        frame = requestAnimationFrame(runIntro);
        return;
      }

      const finishIntro = () => {
        if (introFinishedRef.current) return;
        introFinishedRef.current = true;

        introTweens.current.rot?.kill();
        introTweens.current.rot = undefined;
        gsap.killTweensOf(p);

        p.rotation = 0;
        p.targetRotation = 0;
        p.velocity = 0;
        p.introRadiusMul = 1;
        p.introRadiusBaked = true;

        cards.forEach((card, i) => {
          const tile = tiles[i];
          if (!card || !tile) return;
          card.style.transform = `rotateY(${tile.angle}deg) translateZ(${tile.radius}px) translateY(${tile.rowY}px)`;
        });
        setIntroLit(true);
        setPhase("ready");
      };

      ctx = gsap.context(() => {
        const introTl = gsap.timeline({ delay: 0.1 });
        cards.forEach((card, tileIndex) => {
          const segs = card.querySelectorAll("[data-curve-seg]");
          introTl.to(
            segs,
            { opacity: 1, duration: 0.42, ease: "power2.out" },
            tileIndex * 0.028
          );
        });
        introTweens.current.rot = gsap.to(p, {
          targetRotation: 0,
          duration: ROT_DURATION,
          ease: "power3.out",
        });
        gsap.to(p, {
          introRadiusMul: 1,
          duration: 2.4,
          ease: "power2.out",
        });
        const photoEnd = 0.1 + Math.max(0, (cards.length - 1) * 0.028) + 0.42;
        gsap.delayedCall(Math.max(photoEnd, ROT_DURATION), finishIntro);
      });
    };

    frame = requestAnimationFrame(runIntro);

    return () => {
      cancelAnimationFrame(frame);
      if (!introFinishedRef.current) ctx?.revert();
    };
  }, [phase, tiles, settings.ringSize]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onWheelNative = (e) => {
      if (activeRef.current || embedded) return;
      e.preventDefault();
      interruptIntroRotation();
      const d = (e.deltaY + e.deltaX) * 0.05;
      physics.current.targetRotation += d;
      physics.current.velocity = d * 0.12;
    };

    const handleScrollSync = () => {
      if (activeRef.current || !embedded) return;
      const rect = el.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      if (rect.top < viewHeight && rect.bottom > 0) {
        const totalDist = viewHeight + rect.height;
        const currentDist = viewHeight - rect.top;
        const progress = currentDist / totalDist;
        
        physics.current.targetRotation = progress * 360 * 1.5;
      }
    };

    if (embedded) {
      window.addEventListener("scroll", handleScrollSync, { passive: true });
      handleScrollSync();
    } else {
      el.addEventListener("wheel", onWheelNative, { passive: false });
    }

    return () => {
      if (embedded) {
        window.removeEventListener("scroll", handleScrollSync);
      } else {
        el.removeEventListener("wheel", onWheelNative);
      }
    };
  }, [embedded]);

  useEffect(() => {
    if (phase === "loader") return;

    let frame;
    let peTick = 0;
    const loop = () => {
      const p = physics.current;

      const activeTile = active?.tileIndex ?? -1;

      const dimming = active && !closingRef.current;

      if (!active || closingRef.current) {
        if (!p.isDown && !active) {
          p.targetRotation += p.velocity;
          p.targetTilt += p.velocityTilt;
          p.velocity *= 0.95;
          p.velocityTilt *= 0.9;
        }
        const dimRate = closingRef.current ? 0.2 : 0.1;
        p.dim += (0 - p.dim) * dimRate;
      } else {
        p.velocity = 0;
        p.velocityTilt = 0;
        p.dim += (1 - p.dim) * 0.12;
      }

      p.targetTilt = clamp(p.targetTilt, -44, 26);
      if (!active || closingRef.current) {
        p.rotation += (p.targetRotation - p.rotation) * 0.09;
        p.tilt += (p.targetTilt - p.tilt) * 0.09;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `rotateX(${p.tilt}deg) rotateY(${p.rotation}deg)`;
      }
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `scale(${zoom})`;
        wrapperRef.current.style.opacity = "1";
      }

      if (peTick % 2 === 0) {
        bgRefs.current.forEach((bg, i) => {
          if (!bg) return;
          const speed = (i + 1) * 0.25;
          const bx = Math.sin((p.rotation * Math.PI) / 180) * 90 * speed;
          const by = (p.tilt + 15) * 4 * speed;
          bg.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
        });
      }

      if (!p.introRadiusBaked) {
        const mul = p.introRadiusMul;
        cardsRef.current.forEach((card, i) => {
          const tile = tiles[i];
          if (!card || !tile) return;
          card.style.transform = `rotateY(${tile.angle}deg) translateZ(${tile.radius * mul}px) translateY(${tile.rowY}px)`;
        });
      }

      if (peTick % 4 === 0) {
        const rot = p.rotation;
        const canClick = !active;
        cardsRef.current.forEach((card, i) => {
          const tile = tiles[i];
          if (!card || !tile) return;

          if (i === activeTile) {
            card.style.pointerEvents = "none";
            return;
          }

          const world = ((rot + tile.angle) * Math.PI) / 180;
          const front = Math.cos(world);
          card.style.pointerEvents = front > 0.3 && canClick ? "auto" : "none";

          if (dimming) {
            const fade = 1 - p.dim * 0.9;
            card.style.opacity = (fade * mapRange(front, -1, 1, 0.12, 1)).toString();
            card.style.filter = p.dim > 0.02 ? `blur(${p.dim * 8}px)` : "none";
          } else {
            card.style.opacity = "1";
            card.style.filter = "none";
          }
        });
      }
      peTick++;

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [tiles, zoom, active, phase]);

  const onDown = (e) => {
    if (active) return;
    interruptIntroRotation();
    physics.current.isDown = true;
    physics.current.lastX = e.clientX;
    physics.current.lastY = e.clientY;
    physics.current.velocity = 0;
    physics.current.velocityTilt = 0;
  };

  const onMove = (e) => {
    const p = physics.current;
    if (!p.isDown || active) return;
    const dx = e.clientX - p.lastX;
    const dy = e.clientY - p.lastY;
    p.velocity = dx * 0.18;
    p.velocityTilt = -dy * 0.06;
    p.targetRotation += p.velocity;
    p.targetTilt += p.velocityTilt;
    p.lastX = e.clientX;
    p.lastY = e.clientY;
  };

  const onUp = () => {
    physics.current.isDown = false;
  };

  const handleZoom = (dir) => {
    if (active) return;
    setSettings((s) => ({ ...s, zoom: clamp(s.zoom + dir * 0.15, 0.3, 2) }));
  };

  const openProject = (project, tileIndex) => {
    if (active) return;
    setActive({ project, tileIndex });
  };

  const closeProject = useCallback(() => {
    const meta = expandMetaRef.current;
    if (!active || !meta) {
      setActive(null);
      return;
    }

    closingRef.current = true;
    gsap.to(physics.current, { dim: 0, duration: 0.75, ease: "power2.out" });
    expandTl.current?.kill();

    const isMobile = (rootRef.current?.clientWidth ?? 1000) < 768;
    expandTl.current = gsap.timeline({
      onComplete: () => {
        resetExpandCard();
        expandTl.current = null;
        closingRef.current = false;
        setActive(null);
      },
    });

    const rootRect = rootRef.current.getBoundingClientRect();
    const cardRect = meta.card.getBoundingClientRect();
    const toX = cardRect.left - rootRect.left;
    const toY = cardRect.top - rootRect.top;
    const toW = cardRect.width;
    const toH = cardRect.height;

    expandTl.current
      .to(
        [contentRef.current, detailPanelRef.current],
        { opacity: 0, y: isMobile ? 16 : 0, x: isMobile ? 0 : 20, duration: 0.28, ease: "power2.in" },
        0
      )
      .to(
        meta.hero,
        {
          left: toX,
          top: toY,
          width: toW,
          height: toH,
          opacity: 0,
          duration: 0.85,
          ease: "power3.inOut",
        },
        0
      )
      .to(meta.card, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.55);
  }, [active]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && active) closeProject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, closeProject]);

  useLayoutEffect(() => {
    if (!active || !rootRef.current || !heroRef.current) return;
    const card = cardsRef.current[active.tileIndex];
    const tile = tiles[active.tileIndex];
    if (!card || !tile) return;

    closingRef.current = false;
    const p = physics.current;
    const hero = heroRef.current;
    const rootRect = rootRef.current.getBoundingClientRect();
    const isMobile = rootRect.width < 768;
    const cardRect = card.getBoundingClientRect();
    const startX = cardRect.left - rootRect.left;
    const startY = cardRect.top - rootRect.top;
    const startW = cardRect.width;
    const startH = cardRect.height;
    const end = computeHeroRect(rootRect, tile.width / tile.height, isMobile);
    const faceRot = nearestRotation(p.rotation, -tile.angle);

    expandMetaRef.current = { card, hero };

    gsap.set(hero, {
      left: startX,
      top: startY,
      width: startW,
      height: startH,
      opacity: 0,
    });
    card.style.opacity = "1";
    card.style.zIndex = "120";

    expandTl.current?.kill();
    expandTl.current = gsap.timeline();

    expandTl.current.to(
      p,
      {
        targetRotation: faceRot,
        rotation: faceRot,
        duration: 0.85,
        ease: "power3.inOut",
      },
      0
    );

    expandTl.current.to(
      hero,
      { opacity: 1, duration: 0.38, ease: "power2.inOut" },
      0
    );
    expandTl.current.to(
      card,
      { opacity: 0, duration: 0.38, ease: "power2.inOut" },
      0
    );

    expandTl.current.to(
      hero,
      {
        left: end.x,
        top: end.y,
        width: end.w,
        height: end.h,
        duration: 0.92,
        ease: "power3.inOut",
      },
      0.2
    );

    expandTl.current.fromTo(
      contentRef.current,
      { opacity: 0, y: isMobile ? 20 : 0 },
      { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
      0.42
    );

    expandTl.current.fromTo(
      detailPanelRef.current,
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" },
      0.48
    );
  }, [active, tiles]);

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden select-none font-sans ${
        embedded ? "h-[700px]" : "h-screen min-h-[700px]"
      }`}
      style={{ backgroundColor: t.bg, color: t.text, touchAction: "none" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? `linear-gradient(160deg, #11131a 0%, #1a1f2e 45%, #161a22 100%)`
              : `linear-gradient(160deg, #e9f0f7 0%, #eef3f0 45%, #f4eef2 100%)`,
          }}
        />
        <div
          ref={(el) => { bgRefs.current[0] = el; }}
          className="absolute -top-[10%] left-[8%] w-[55vw] h-[55vw] rounded-full"
          style={{
            background: `radial-gradient(circle, ${ac}${isDark ? "55" : "44"} 0%, transparent 62%)`,
            filter: "blur(90px)",
          }}
        />
        <div
          ref={(el) => { bgRefs.current[1] = el; }}
          className="absolute top-[15%] right-[2%] w-[50vw] h-[50vw] rounded-full"
          style={{
            background: `radial-gradient(circle, ${isDark ? "#43e97b55" : "#7fe3b340"} 0%, transparent 60%)`,
            filter: "blur(100px)",
          }}
        />
        <div
          ref={(el) => { bgRefs.current[2] = el; }}
          className="absolute bottom-[-15%] left-[20%] w-[60vw] h-[60vw] rounded-full"
          style={{
            background: `radial-gradient(circle, ${isDark ? "#a18cd155" : "#c4b5f540"} 0%, transparent 60%)`,
            filter: "blur(110px)",
          }}
        />
        <div
          ref={(el) => { bgRefs.current[3] = el; }}
          className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full"
          style={{
            background: `radial-gradient(circle, ${isDark ? "#fbc2eb44" : "#fdd0b540"} 0%, transparent 60%)`,
            filter: "blur(100px)",
          }}
        />
      </div>

      <div
        className={`absolute top-6 left-6 z-30 pointer-events-none transition-opacity duration-500 ${
          active || phase === "loader" ? "opacity-0" : "opacity-100"
        }`}
      >
        <h1 className="text-sm font-bold tracking-widest uppercase font-display" style={{ color: t.text }}>
          Atelier — Women's Collection
        </h1>
        <p className="text-xs mt-1 font-futura" style={{ color: t.textMuted }}>
          Scroll, drag, and tap a piece to shop
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            navigate('/auth', { state: { from: location.pathname, message: 'Please sign in or register to view your shopping bag.' } });
          }
        }}
        className={`absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all duration-500 font-futura cursor-pointer ${
          phase === "loader" ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"
        }`}
        style={{ backgroundColor: `${t.surface}CC`, borderColor: t.border, color: t.text }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
        <span className="text-xs font-semibold tracking-wide">Cart</span>
        <span
          className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold"
          style={{ backgroundColor: ac, color: t.bg }}
        >
          {isAuthenticated ? cartCount : 0}
        </span>
      </button>

      {toast && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-[70] px-5 py-2.5 rounded-full border backdrop-blur-md shadow-lg pointer-events-none animate-in fade-in slide-in-from-top-2 font-futura"
          style={{ backgroundColor: `${t.surface}F2`, borderColor: t.border, color: t.text }}
          role="status"
          aria-live="polite"
        >
          <span className="text-xs font-medium">{toast}</span>
        </div>
      )}



      <div
        className={`absolute bottom-6 right-6 z-30 flex gap-2 transition-opacity duration-500 ${
          active || phase === "loader" ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handleZoom(-1); }}
          className="w-10 h-10 flex items-center justify-center rounded-full border transition-transform hover:scale-105 active:scale-95 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2"
          style={{ backgroundColor: `${t.surface}AA`, borderColor: t.border, color: t.text }}
          aria-label="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoom(1); }}
          className="w-10 h-10 flex items-center justify-center rounded-full border transition-transform hover:scale-105 active:scale-95 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2"
          style={{ backgroundColor: `${t.surface}AA`, borderColor: t.border, color: t.text }}
          aria-label="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
        </button>
      </div>



      {phase === "loader" && (
        <RingLoader
          stroke={loaderStroke}
          bg={t.bg}
          onComplete={() => setPhase("intro")}
        />
      )}

      {phase !== "loader" && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            active ? "z-30" : "z-10"
          }`}
          style={{ perspective: `${settings.perspective}px` }}
        >
          <div ref={wrapperRef} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
            <div
              ref={ringRef}
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                willChange: "transform",
                transform: `rotateX(${settings.tilt}deg) rotateY(-360deg)`,
              }}
            >
              {tiles.map((tile, i) => (
                <button
                   key={tile.key}
                   ref={(el) => { cardsRef.current[i] = el; }}
                   onClick={(e) => { e.stopPropagation(); openProject(tile.project, i); }}
                   className="absolute top-1/2 left-1/2 focus-visible:outline-none focus-visible:ring-2"
                   style={{
                     width: tile.width,
                     height: tile.height,
                     marginLeft: -tile.width / 2,
                     marginTop: -tile.height / 2,
                     transformStyle: "preserve-3d",
                     willChange: "transform",
                     transform: `rotateY(${tile.angle}deg) translateZ(${tile.radius * (INTRO_START_RADIUS / settings.ringSize)}px) translateY(${tile.rowY}px)`,
                   }}
                   aria-label={`View ${tile.project.title}`}
                >
                  <div
                    className="absolute inset-0"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <CurvedSurface
                      width={tile.width}
                      height={tile.height}
                      image={tile.project.image}
                      bend={tile.bend}
                      focalX={tile.focalX}
                      focalY={tile.focalY}
                      lit={introLit}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {active && (
        <>
          <div
            className="absolute inset-0 z-20 pointer-events-auto"
            onClick={closeProject}
            aria-hidden
          />

          <div
            ref={heroRef}
            className="absolute z-[35] overflow-hidden pointer-events-none"
            style={{ opacity: 0 }}
          >
            <img
              src={active.project.image}
              alt=""
              draggable={false}
              decoding="async"
              className="w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: `${Math.round((tiles[active.tileIndex]?.focalX ?? 0.5) * 100)}% ${Math.round((tiles[active.tileIndex]?.focalY ?? 0.5) * 100)}%`,
              }}
            />
          </div>

          <div
            ref={contentRef}
            className="absolute inset-0 z-40 flex items-end md:items-center justify-center pointer-events-none p-5 md:p-8 font-sans"
          >
            <div className="w-full max-w-[1500px] mx-auto min-h-full flex flex-col justify-end md:min-h-0 md:flex-row md:items-center md:justify-end gap-6 md:gap-10 pointer-events-none">
              <div
                ref={detailPanelRef}
                className="relative w-full md:w-[420px] md:shrink-0 pointer-events-auto rounded-3xl border overflow-hidden md:ml-auto"
                style={{
                  backgroundColor: isDark ? "rgba(12,14,20,0.72)" : "rgba(255,255,255,0.82)",
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  backdropFilter: "blur(24px)",
                  boxShadow: isDark
                    ? "0 32px 80px rgba(0,0,0,0.45)"
                    : "0 32px 80px rgba(0,0,0,0.12)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${ac}, transparent)`,
                  }}
                />
                <div
                  className="absolute -right-6 -top-10 text-[7rem] font-bold leading-none select-none pointer-events-none font-display opacity-10"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                  }}
                >
                  {(PROJECTS.findIndex((p) => p.id === active.project.id) + 1)
                    .toString()
                    .padStart(2, "0")}
                </div>

                <div className="relative p-7 md:p-8">
                  <div className="flex items-center gap-3 mb-5 font-futura">
                    <span
                      className="px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full"
                      style={{ backgroundColor: `${ac}22`, color: ac, border: `1px solid ${ac}44` }}
                    >
                      {active.project.category}
                    </span>
                    <span
                      className="text-xs font-mono tracking-widest"
                      style={{ color: t.textMuted }}
                    >
                      {active.project.year}
                    </span>
                  </div>

                  <h2
                    className="text-3xl md:text-[2.6rem] font-bold mb-4 tracking-tight leading-[1.05] font-display"
                    style={{ color: t.text }}
                  >
                    {active.project.title}
                  </h2>

                  <p
                    className="text-[15px] mb-8 leading-relaxed max-w-sm font-futura font-light"
                    style={{ color: t.textSecondary }}
                  >
                    {active.project.desc}
                  </p>

                  <div
                    className="grid grid-cols-2 gap-6 mb-8 pb-7 border-b font-futura"
                    style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
                  >
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.18em] mb-1.5 text-gold font-bold"
                        style={{ color: ac }}
                      >
                        Model
                      </p>
                      <p className="text-sm font-medium" style={{ color: t.text }}>
                        {active.project.model}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.18em] mb-1.5 text-gold font-bold"
                        style={{ color: ac }}
                      >
                        Price
                      </p>
                      <p className="text-sm font-mono font-medium" style={{ color: t.text }}>
                        ${active.project.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 font-futura">
                    <button
                      onClick={() => {
                        addToCart(active.project);
                        closeProject();
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-transform hover:scale-[1.03] active:scale-[0.98]"
                      style={{ backgroundColor: ac, color: isDark ? "#1C1C1C" : "#FAF9F6" }}
                    >
                      Add to Cart
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
                    </button>
                    <button
                      onClick={closeProject}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
                      style={{ color: t.textMuted }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={closeProject}
            className="absolute top-6 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full border transition-transform hover:scale-105 active:scale-95 pointer-events-auto"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
              color: t.text,
              backdropFilter: "blur(12px)",
            }}
            aria-label="Close project"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </>
      )}
    </div>
  );
}

export default CurvedRingArchive;
