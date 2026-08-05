import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ScrollReveal from '../../components/effects/ScrollReveal';
import SEO from '../../components/layout/SEO';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useProducts, useCategories } from '../../api/products';
import ProductSkeletonGrid from '../../components/product/ProductSkeletonGrid';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { getImageUrl } from '../../utils/imageUrl';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import useUiStore from '../../store/uiStore';
import useCustomerAuthStore from '../../store/customerAuthStore';
import useWishlistStore from '../../store/wishlistStore';
import { addToCart, fetchCart } from '../../api/cart';

// ─── Color map for variant swatches ─────────────────────────────────────────
const COLOR_MAP = {
  'Noir': '#0A0A0A',
  'Ivory': '#F5F0E8',
  'Gold': '#C9A84C',
  'Crimson': '#8B0000',
  'Emerald': '#50C878',
  'Navy': '#000080',
  'White': '#F8F8F8',
  'Black': '#111111',
  'Beige': '#D9C9A3',
  'Rose': '#C36E87',
  'Burgundy': '#722F37',
  'Taupe': '#B5A08A',
  'Champagne': '#F7E7CE',
  'Blush': '#F4C2C2',
  'Slate': '#708090',
  'Olive': '#808000',
  'Chocolate': '#7B3F00',
  'Camel': '#C19A6B',
  'Sand': '#C2B280',
  'Grey': '#9E9E9E',
  'Silver': '#C0C0C0',
  'Red': '#CC0000',
  'Blue': '#1a4b8c',
  'Green': '#2E8B57',
};

// ─── Category bubble image map (keyed by real DB slugs) ──────────────────────
const CATEGORY_IMAGES = {
  // "All" pseudo-category
  'all':           'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop',
  // Real DB slugs from seed-data.js
  'evening-wear':  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=200&auto=format&fit=crop',
  'bridal':        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200&auto=format&fit=crop',
  'resort':        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=200&auto=format&fit=crop',
  'accessories':   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=200&auto=format&fit=crop',
  'pret-a-porter': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop',
  'shoes':         'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200&auto=format&fit=crop',
  // Common alias slugs (fallbacks)
  'dresses':       'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=200&auto=format&fit=crop',
  'clothing':      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop',
  'bags':          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=200&auto=format&fit=crop',
  'footwear':      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200&auto=format&fit=crop',
  'beauty':        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200&auto=format&fit=crop',
  'jewellery':     'https://images.unsplash.com/photo-1611085583191-a3b181a88557?q=80&w=200&auto=format&fit=crop',
  'electronics':   'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=200&auto=format&fit=crop',
};

// Fallback for any slug not in the map — generic fashion editorial image
const FALLBACK_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=200&auto=format&fit=crop';

const getCategoryImage = (slug) => CATEGORY_IMAGES[slug] || CATEGORY_IMAGES[slug?.toLowerCase()] || FALLBACK_CATEGORY_IMAGE;

// ─── Recently Viewed hook ─────────────────────────────────────────────────────
const RECENTLY_VIEWED_KEY = 'elesene-recently-viewed';
const MAX_RECENTLY_VIEWED = 10;

const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = sessionStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.warn('Failed to parse recently viewed:', err);
      return [];
    }
  });

  const addRecentlyViewed = useCallback((product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      try { sessionStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next)); } catch (err) {
        console.warn('Failed to save recently viewed:', err);
      }
      return next;
    });
  }, []);

  return { recentlyViewed, addRecentlyViewed };
};

// ─── Wishlist hook ───────────────────────────────────────────────────────────
const useWishlist = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const wishlistIds = useWishlistStore(s => s.wishlistIds);
  const toggleWishlistStore = useWishlistStore(s => s.toggleWishlist);

  // Wishlist is fetched once on login by the auth store — no per-component fetch needed.

  const toggleWishlist = useCallback((productId) => {
    return toggleWishlistStore(productId, navigate, location.pathname);
  }, [toggleWishlistStore, navigate, location.pathname]);

  const isWishlisted = useCallback((productId) => {
    if (!productId) return false;
    return wishlistIds.includes(String(productId));
  }, [wishlistIds]);

  return { toggleWishlist, isWishlisted };
};

// ─── Marquee Ticker ──────────────────────────────────────────────────────────
const MarqueeTicker = () => {
  const items = ['DRESSES', 'GOWNS', 'RESORT WEAR', 'FOOTWEAR', 'ACCESSORIES', 'SILK SETS', 'COUTURE', 'JEWELLERY'];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden bg-ivory text-noir py-2.5 border-y border-black/5">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-[9px] font-futura tracking-[0.35em] uppercase mx-6 flex items-center gap-6">
            {item}
            <span className="w-1 h-1 rounded-full bg-gold inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ─── Hero Section ─────────────────────────────────────────────────────────────
const ShopHero = ({ isFiltered }) => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  if (isFiltered) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 mb-12">
        <ScrollReveal variant="fade-up">
          <div className="text-center py-12">
            <h1 className="text-4xl sm:text-6xl font-display font-bold text-ivory uppercase tracking-tighter mb-4">
              The Collection
            </h1>
            <p className="text-ivory/50 text-sm max-w-lg mx-auto font-futura font-light leading-relaxed">
              Timeless elegance meets modern sophistication.
            </p>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div ref={heroRef} className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-black/8 shadow-lg min-h-[320px] md:min-h-[440px] bg-white">

        {/* Left: Typography Block */}
        <div className="flex flex-col justify-center px-8 sm:px-12 md:px-16 py-12 md:py-0 bg-noir order-2 md:order-1">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-[9px] font-futura tracking-[0.5em] uppercase text-gold-light font-bold mb-3 block"
          >
            Latest Release · 2026
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-ivory uppercase leading-[0.95] tracking-tight mb-6"
          >
            New<br />
            <span className="relative inline-block">
              <span className="text-gold italic">Arrivals</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                className="absolute left-0 -bottom-1.5 h-[2px] w-full bg-gold/50 origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-ivory/60 text-xs font-futura font-light leading-relaxed max-w-xs mb-8"
          >
            Handpicked styles for every mood. Discover timeless pieces designed to empower your every moment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <Link
              to="/shop?sort=newest"
              className="inline-flex items-center gap-3 bg-gold/10 border border-gold/30 text-gold text-[9px] font-futura tracking-[0.3em] uppercase px-6 py-3 rounded-full hover:bg-gold hover:text-noir transition-all duration-300 font-bold group"
            >
              Explore Collection
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Right: Parallax Image */}
        <div className="relative overflow-hidden aspect-[3/4] md:aspect-auto order-1 md:order-2 min-h-[280px]">
          <motion.img
            style={{ y: imageY }}
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop"
            alt="New Arrivals editorial fashion photography"
            className="w-full h-full object-cover object-top scale-110"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-5 right-5 bg-gold text-noir text-[8px] font-futura tracking-[0.3em] uppercase font-black px-3 py-1.5 rounded-full shadow-lg">
            SS 2026
          </div>
        </div>
      </div>

      {/* Marquee ticker below hero */}
      <div className="mt-3 rounded-xl overflow-hidden">
        <MarqueeTicker />
      </div>
    </div>
  );
};

// ─── Category Bubbles ──────────────────────────────────────────────────
const CategoryBubbles = ({ categories, activeCategory, onSelect }) => {
  const scrollRef = useRef(null);
  const allCategories = [{ id: 'all', name: 'All', slug: '' }, ...categories];

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 sm:gap-5 items-start overflow-x-auto scrollbar-hide pb-2"
      role="navigation"
      aria-label="Product categories"
    >
      {allCategories.map((cat) => {
        const isActive = cat.slug === activeCategory;
        const imgSrc = getCategoryImage(cat.slug);
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug)}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl"
            aria-label={`Filter by ${cat.name}`}
            aria-pressed={isActive}
          >
            {/* Circle image */}
            <div className={`
              relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 transition-all duration-300
              ${isActive
                ? 'border-gold shadow-md shadow-gold/20 scale-105'
                : 'border-black/10 group-hover:border-gold/40 group-hover:scale-103'
              }
            `}>
              <img
                src={imgSrc}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              {isActive && (
                <div className="absolute inset-0 bg-gold/20 mix-blend-overlay" />
              )}
            </div>
            {/* Label — single line, ellipsis for long names */}
            <span
              className={`
                text-[8px] font-futura tracking-[0.12em] uppercase transition-colors duration-300
                text-center leading-none w-14 sm:w-16 truncate block
                ${isActive ? 'text-gold font-bold' : 'text-ivory/50 group-hover:text-ivory'}
              `}
              title={cat.name}
            >
              {cat.name}
            </span>
            {isActive && (
              <motion.div
                layoutId="cat-indicator"
                className="w-1 h-1 rounded-full bg-gold"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── Filter Bar ──────────────────────────────────────────────────────────
const FilterBar = ({
  searchInput, onSearchChange,
  minPriceInput, setMinPriceInput,
  maxPriceInput, setMaxPriceInput,
  onPriceSubmit, sort, onSortChange,
  onReset, hasActiveFilters, activeFilterCount,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 320);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className={`transition-all duration-500 z-30 ${isSticky ? 'sticky top-[60px] md:top-[68px]' : 'relative'}`}
    >
      <div className={`
        rounded-2xl px-4 py-3 transition-all duration-300
        ${isSticky
          ? 'glass-md shadow-lg'
          : 'glass-subtle'
        }
      `}>
        {/* Single compact row — wraps naturally on mobile */}
        <div className="flex flex-wrap gap-2 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-[140px] max-w-[220px]">
            <label htmlFor="shop-search-input" className="sr-only">Search Catalog</label>
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ivory/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="shop-search-input"
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={onSearchChange}
              className="w-full pl-7 pr-3 py-1.5 bg-black/5 border border-black/8 rounded-full text-ivory text-[11px] font-futura placeholder:text-ivory/30 focus:outline-none focus:border-gold/50 focus:bg-white/80 transition-all duration-300"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-black/10" />

          {/* Price Range */}
          <form onSubmit={onPriceSubmit} className="flex items-center gap-1.5">
            <label htmlFor="min-price-input" className="sr-only">Minimum Price</label>
            <input
              id="min-price-input"
              type="number"
              placeholder="Min ₹"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-16 bg-black/5 border border-black/8 rounded-full px-2.5 py-1.5 text-ivory text-[11px] font-futura placeholder:text-ivory/30 focus:outline-none focus:border-gold/50 transition-all duration-300 text-center"
            />
            <span className="text-ivory/25 text-[10px]">–</span>
            <label htmlFor="max-price-input" className="sr-only">Maximum Price</label>
            <input
              id="max-price-input"
              type="number"
              placeholder="Max ₹"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-16 bg-black/5 border border-black/8 rounded-full px-2.5 py-1.5 text-ivory text-[11px] font-futura placeholder:text-ivory/30 focus:outline-none focus:border-gold/50 transition-all duration-300 text-center"
            />
            <button
              type="submit"
              className="px-3 py-1.5 glass-gold hover:bg-gold/20 hover:border-gold/50 text-gold text-[9px] font-futura uppercase tracking-widest rounded-full transition-all duration-300 font-bold cursor-pointer"
            >
              Go
            </button>
          </form>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-black/10" />

          {/* Sort */}
          <div className="relative">
            <label htmlFor="shop-sort-select" className="sr-only">Sort Products</label>
            <select
              id="shop-sort-select"
              value={sort}
              onChange={onSortChange}
              className="appearance-none bg-black/5 border border-black/8 rounded-full pl-3 pr-7 py-1.5 text-ivory text-[11px] font-futura focus:outline-none focus:border-gold/50 cursor-pointer transition-all duration-300"
            >
              <option value="newest" className="bg-noir">Newest</option>
              <option value="price_asc" className="bg-noir">Price ↑</option>
              <option value="price_desc" className="bg-noir">Price ↓</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-ivory/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white text-[9px] font-futura uppercase tracking-widest rounded-full transition-all duration-300 font-bold cursor-pointer"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear {activeFilterCount > 0 && `(${activeFilterCount})`}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Quick Add Panel (slides up from card bottom on hover) ────────────────────
const QuickAddPanel = ({ product, isVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCartOptimistic, syncFromServer } = useCartStore();
  const { openCart } = useUiStore();
  const { isAuthenticated } = useCustomerAuthStore();

  const variants = useMemo(() => product.variants || [], [product.variants]);
  const allColors = useMemo(() => [...new Set(variants.map(v => v.color).filter(Boolean))], [variants]);

  const [selectedColor, setSelectedColor] = useState(allColors[0] || null);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [added, setAdded]                 = useState(false);

  // Reset state when panel closes
  useEffect(() => {
    let timer;
    if (!isVisible) {
      timer = setTimeout(() => {
        setSelectedSize(null);
        setAdded(false);
      }, 0);
    } else if (allColors[0]) {
      timer = setTimeout(() => {
        setSelectedColor(allColors[0]);
      }, 0);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [isVisible, allColors]);

  const availableSizesForColor = useMemo(() => {
    if (variants.length === 0) return [];
    const filtered = selectedColor 
      ? variants.filter(v => v.color === selectedColor).map(v => v.size)
      : variants.map(v => v.size);
    return [...new Set(filtered.filter(Boolean))];
  }, [variants, selectedColor]);

  // If there's only 1 size, auto-select it. Otherwise keep user's selection.
  const effectiveSelectedSize = selectedSize || (availableSizesForColor.length === 1 ? availableSizesForColor[0] : null);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location.pathname, message: 'Please sign in or register to add items to your bag.' } });
      return;
    }
    if (!effectiveSelectedSize) return;

    const variant = variants.find(v => (v.color === selectedColor || !v.color) && v.size === effectiveSelectedSize)
      || variants.find(v => v.size === effectiveSelectedSize)
      || variants[0]
      || { id: null, size: effectiveSelectedSize, color: selectedColor || 'Default' };

    // Instant optimistic update
    addToCartOptimistic(product, variant, 1);
    setAdded(true);
    setTimeout(() => { openCart(); }, 350);

    // Server sync for both authenticated and guest users
    try {
      await addToCart({ product_id: product.id, variant_id: variant.id, quantity: 1 });
      const cartRes = await fetchCart();
      if (cartRes?.success && cartRes.cart?.CartItems) {
        syncFromServer(cartRes.cart.CartItems);
      }
    } catch {
      // Silent — optimistic state is already shown
    }
  };

  // No variants — show simple "View Product" CTA
  if (variants.length === 0) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={isVisible ? { y: 0 } : { y: '100%' }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="absolute bottom-0 left-0 right-0 z-20"
        onClick={e => e.stopPropagation()}
      >
        <div className="glass-lg px-4 py-3 rounded-b-2xl border-t border-white/25">
          <Link
            to={`/product/${product.slug}`}
            className="block w-full text-center text-[9px] font-futura font-bold tracking-[0.3em] uppercase text-white py-2.5 bg-ivory hover:bg-gold hover:text-noir transition-colors duration-300 rounded-lg"
          >
            View Details →
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={isVisible ? { y: 0 } : { y: '100%' }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="absolute bottom-0 left-0 right-0 z-20"
      onClick={e => e.stopPropagation()}
    >
      <div className="glass-md px-3 pt-3 pb-3 rounded-b-2xl border-t border-white/20 shadow-lg">

        {/* Color row */}
        {allColors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5">
            {allColors.slice(0, 5).map((color) => {
              const hex = COLOR_MAP[color] || '#CCCCCC';
              const isActive = selectedColor === color;
              return (
                <button
                  key={color}
                  title={color}
                  onClick={(e) => { e.stopPropagation(); setSelectedColor(color); setSelectedSize(null); }}
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-200 cursor-pointer focus-visible:outline-none ${
                    isActive ? 'border-gold scale-110 shadow-sm shadow-gold/20' : 'border-transparent hover:border-black/20'
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={`Select color ${color}`}
                  aria-pressed={isActive}
                />
              );
            })}
            <span className="text-[8px] font-futura text-ivory/50 ml-auto">{selectedColor}</span>
          </div>
        )}

        {/* Size row */}
        {availableSizesForColor.length > 0 && (
          <div className="flex gap-1 mb-2.5">
            {availableSizesForColor.map((size) => {
              const isSelected = effectiveSelectedSize === size;
              return (
                <button
                  key={size}
                  onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                  className={`
                    flex-1 py-1.5 px-1 text-[9px] font-futura font-bold tracking-wider rounded-md transition-all duration-200 cursor-pointer focus-visible:outline-none
                    ${isSelected
                      ? 'bg-ivory text-white shadow-sm'
                      : 'bg-black/5 text-ivory/70 hover:bg-black/10 hover:text-ivory'
                    }
                  `}
                  aria-label={`Size ${size}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}

        {/* Add to Bag button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          disabled={!effectiveSelectedSize && availableSizesForColor.length > 0}
          className={`
            w-full py-3 rounded-xl text-[10px] font-futura font-bold tracking-[0.25em] uppercase
            transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
            flex items-center justify-center gap-2
            ${added
              ? 'bg-green-600 text-white'
              : (effectiveSelectedSize || availableSizesForColor.length === 0)
                ? 'glass-gold border border-gold/30 text-gold hover:bg-gold/25 hover:border-gold/60 shadow-lg hover:shadow-xl'
                : 'glass-subtle text-ivory/30 cursor-not-allowed'
            }
          `}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                ADDED TO BAG
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {effectiveSelectedSize ? 'ADD TO BAG' : 'SELECT SIZE'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, isWishlisted, onWishlistToggle, onHover }) => {
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || '';
  const secondaryImage = product.images?.find(img => !img.is_primary && img.image_url !== primaryImage)?.image_url || '';
  const imageUrl = getImageUrl(primaryImage);
  const secondaryImageUrl = secondaryImage ? getImageUrl(secondaryImage) : '';

  const variantColors = product.variants
    ? [...new Set(product.variants.map(v => v.color).filter(Boolean))].slice(0, 5)
    : [];

  const [now] = useState(() => Date.now());
  const isNew = useMemo(() => {
    if (product.is_new) return true;
    if (!product.created_at) return false;
    return new Date(product.created_at).getTime() > now - 14 * 24 * 60 * 60 * 1000;
  }, [product.is_new, product.created_at, now]);
  const isBestSeller = product.is_trending || product.is_bestseller;
  const price = Number(product.base_price || 0);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (onHover) onHover(product);
  }, [onHover, product]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.04 }}
      className="group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image + Quick-Add block */}
      <div
        className="relative aspect-[3/4] bg-slate rounded-2xl overflow-hidden mb-4 border border-black/5 shadow-sm group-hover:shadow-lg transition-all duration-500"
      >
        {/* Main / secondary image */}
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full focus-visible:outline-none rounded-2xl"
          data-cursor="VIEW"
          tabIndex={0}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={product.name ? `${product.name} — ELESENE` : 'ELESENE product'}
                className={`w-full h-full object-cover transition-all duration-700 ${isHovered && secondaryImageUrl ? 'opacity-0' : 'opacity-100'} group-hover:scale-[1.04]`}
                loading={index < 4 ? 'eager' : 'lazy'}
                fetchPriority={index < 4 ? 'high' : 'auto'}
                decoding="async"
              />
              {secondaryImageUrl && (
                <img
                  src={secondaryImageUrl}
                  alt={`${product.name} alternate view`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'} group-hover:scale-[1.04]`}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate/80">
              <svg className="w-8 h-8 text-ivory/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-500" />
        </Link>

        {/* Badge */}
        {(isNew || isBestSeller) && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            {isBestSeller
              ? <span className="bg-gold text-noir text-[7px] font-futura tracking-[0.2em] uppercase font-black px-2.5 py-1 rounded-full shadow-md">Best Seller</span>
              : <span className="bg-ivory text-white text-[7px] font-futura tracking-[0.2em] uppercase font-black px-2.5 py-1 rounded-full shadow-md">New</span>
            }
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlistToggle(product.id); }}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 flex items-center justify-center shadow-sm hover:bg-red-50 hover:border-red-200 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <motion.svg
            key={isWishlisted ? 'filled' : 'outline'}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`w-3.5 h-3.5 ${isWishlisted ? 'text-red-500' : 'text-ivory/40'}`}
            fill={isWishlisted ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </motion.svg>
        </button>

        {/* Quick-Add Panel */}
        <QuickAddPanel product={product} isVisible={isHovered} />
      </div>

      {/* Product info below card */}
      <div className="px-1">
        <span className="text-[8px] font-futura tracking-[0.3em] uppercase text-gold-light font-bold block mb-1">
          {product.brand || 'ELESENE'}
        </span>
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link to={`/product/${product.slug}`} className="flex-1 focus-visible:outline-none">
            <h3 className="text-sm font-display text-ivory group-hover:text-gold transition-colors duration-300 leading-snug font-bold line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <span className="text-sm font-futura text-ivory/80 font-bold tabular-nums shrink-0 pt-0.5">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Color swatches */}
        {variantColors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {variantColors.map((color, i) => {
              const hex = COLOR_MAP[color] || '#CCCCCC';
              return (
                <span
                  key={i}
                  title={color}
                  className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-sm inline-block"
                  style={{ backgroundColor: hex }}
                />
              );
            })}
            {variantColors.length > 3 && (
              <span className="text-[8px] text-ivory/40 font-futura">+{variantColors.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Numbered Pagination ──────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 border-t border-black/5 pt-12 mt-4">
      {/* Prev */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center text-ivory/50 hover:text-gold hover:border-gold/30 bg-white transition-all duration-300 disabled:opacity-25 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold text-xs"
      >
        ←
      </button>

      {/* Page numbers */}
      {getPages().map((p, i) => (
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="text-ivory/30 text-xs w-9 text-center font-futura">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={page === p ? 'page' : undefined}
            className={`
              w-9 h-9 rounded-xl text-xs font-futura font-bold transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold border
              ${page === p
                ? 'bg-ivory text-white border-ivory shadow-sm'
                : 'border-black/8 text-ivory/50 hover:text-gold hover:border-gold/30 bg-white'
              }
            `}
          >
            {p}
          </button>
        )
      ))}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center text-ivory/50 hover:text-gold hover:border-gold/30 bg-white transition-all duration-300 disabled:opacity-25 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold text-xs"
      >
        →
      </button>
    </div>
  );
};

// ─── Editorial Spotlight ──────────────────────────────────────────────────────
const EditorialSpotlight = () => (
  <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 mt-20 mb-10">
    <ScrollReveal variant="fade-up">
      <div className="relative rounded-2xl overflow-hidden bg-ivory min-h-[280px] sm:min-h-[340px] flex flex-col sm:flex-row">
        {/* Text block */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 md:px-16 py-12 z-10 relative">
          <span className="text-[8px] font-futura tracking-[0.5em] uppercase text-gold-light font-bold mb-4 block">
            ELESENE Edit
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white uppercase leading-tight mb-4">
            Timeless Pieces,<br />
            <span className="italic text-gold">Modern Muse</span>
          </h2>
          <p className="text-white/55 text-xs font-futura font-light leading-relaxed max-w-xs mb-8">
            Explore our curation of pieces that blend heritage with modern sophistication.
          </p>
          <Link
            to="/lookbook"
            className="inline-flex items-center gap-3 border border-white/20 text-white text-[9px] font-futura tracking-[0.3em] uppercase px-6 py-3 rounded-full hover:bg-white hover:text-ivory transition-all duration-300 font-bold w-fit group"
          >
            Discover Edit
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>

        {/* Images */}
        <div className="hidden sm:flex flex-row flex-1 items-stretch gap-0">
          <div className="relative flex-1 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop"
              alt="ELESENE editorial fashion editorial 1"
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-all duration-700 hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ivory via-transparent to-transparent" />
          </div>
          <div className="relative flex-1 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
              alt="ELESENE editorial fashion editorial 2"
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-all duration-700 hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="relative flex-1 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop"
              alt="ELESENE editorial fashion editorial 3"
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-all duration-700 hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </ScrollReveal>
  </div>
);

// ─── Recently Viewed Carousel ─────────────────────────────────────────────────
const RecentlyViewedCarousel = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 mb-8">
      <ScrollReveal variant="fade-up">
        <div className="border-t border-black/5 pt-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[9px] font-futura tracking-[0.4em] uppercase text-ivory/50 font-bold">Recently Viewed</span>
            <div className="flex-1 h-px bg-black/5" />
          </div>
          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
            {items.map((product, i) => {
              const imgUrl = getImageUrl(
                product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || ''
              );
              return (
                <Link
                  key={`${product.id}-${i}`}
                  to={`/product/${product.slug}`}
                  className="shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl"
                >
                  <div className="w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden border border-black/5 bg-slate mb-2 group-hover:border-gold/20 transition-all duration-300">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate/80" />
                    )}
                  </div>
                  <p className="text-[9px] font-futura text-ivory/60 group-hover:text-gold transition-colors duration-300 truncate max-w-[96px] sm:max-w-[112px] text-center">
                    {product.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

// ─── Main ShopPage ────────────────────────────────────────────────────────────
const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page     = parseInt(searchParams.get('page') || '1', 10);

  // Controlled input state (stays local until submission/change)
  const [prevSearch, setPrevSearch]     = useState(search);
  const [searchInput, setSearchInput]   = useState(search);
  if (prevSearch !== search) { setPrevSearch(search); setSearchInput(search); }

  const [prevMinPrice, setPrevMinPrice]       = useState(minPrice);
  const [minPriceInput, setMinPriceInput]     = useState(minPrice);
  if (prevMinPrice !== minPrice) { setPrevMinPrice(minPrice); setMinPriceInput(minPrice); }

  const [prevMaxPrice, setPrevMaxPrice]       = useState(maxPrice);
  const [maxPriceInput, setMaxPriceInput]     = useState(maxPrice);
  if (prevMaxPrice !== maxPrice) { setPrevMaxPrice(maxPrice); setMaxPriceInput(maxPrice); }

  const queryParams = {
    page, limit: 12, sort,
    ...(search   && { search }),
    ...(category && { category }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
  };

  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts(queryParams);
  const { data: categoriesData } = useCategories();

  const categories  = categoriesData?.categories || [];
  const products    = productsData?.products     || [];
  const totalPages  = productsData?.totalPages   || 1;

  // Wishlist & recently viewed
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();

  // Track recently viewed products when visiting product pages
  // (we track from the shop grid by saving products to sessionStorage on link hover for intent)
  const handleProductLinkHover = useCallback((product) => {
    addRecentlyViewed(product);
  }, [addRecentlyViewed]);

  // Url param updaters
  const updateParams = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        nextParams.set(key, val);
      } else {
        nextParams.delete(key);
      }
    });
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleCategorySelect   = (slug) => updateParams({ category: slug });
  const handleSortChange       = (e)    => updateParams({ sort: e.target.value });
  const handlePriceFilterSubmit = (e)  => { e.preventDefault(); updateParams({ minPrice: minPriceInput, maxPrice: maxPriceInput }); };
  const handleSearchChange     = (e)   => {
    setSearchInput(e.target.value);
    const nextParams = new URLSearchParams(searchParams);
    if (e.target.value) { nextParams.set('search', e.target.value); } else { nextParams.delete('search'); }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };
  const handleResetFilters = () => {
    setSearchInput(''); setMinPriceInput(''); setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
  };
  const handlePageChange = (p) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', p.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters  = !!(search || category || minPrice || maxPrice || sort !== 'newest');
  const activeFilterCount = [search, category, minPrice || maxPrice, sort !== 'newest'].filter(Boolean).length;
  const isFiltered        = !!(search || category || minPrice || maxPrice || sort !== 'newest');

  return (
    <div className="bg-noir min-h-screen selection:bg-gold/40 selection:text-ivory">
      <SEO
        title="Shop Collection"
        description="Discover our latest curated collections of luxury fashion — dresses, accessories, footwear and more. New arrivals updated weekly."
      />
      <CustomCursor />
      <Navbar />

      <main className="pt-24 md:pt-32 pb-24">

        {/* ── Hero ── */}
        <ShopHero isFiltered={isFiltered} />

        {/* ── Category + Filter block ── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 mb-8">

          {/* Category Bubbles */}
          <div className="mb-6">
            <CategoryBubbles
              categories={categories}
              activeCategory={category}
              onSelect={handleCategorySelect}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-black/5 mb-6" />

          {/* Filter Bar */}
          <FilterBar
            searchInput={searchInput}         onSearchChange={handleSearchChange}
            minPriceInput={minPriceInput}     setMinPriceInput={setMinPriceInput}
            maxPriceInput={maxPriceInput}     setMaxPriceInput={setMaxPriceInput}
            onPriceSubmit={handlePriceFilterSubmit}
            sort={sort}                       onSortChange={handleSortChange}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* ── Product Grid ── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16">
          {productsLoading ? (
            <ProductSkeletonGrid count={8} />
          ) : productsError ? (
            <ErrorState error={productsError} context="general" onRetry={refetchProducts} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="No Atelier Items Found"
              description="We could not find any creations matching your parameters. Try adjusting filters or search terms."
              primaryAction={{ label: 'Reset All Filters', onClick: handleResetFilters }}
            />
          ) : (
            <>
              {/* Result count */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[9px] font-futura tracking-widest text-ivory/40 uppercase">
                  {productsData?.totalCount ?? products.length} {productsData?.totalCount === 1 ? 'piece' : 'pieces'}
                </span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 mb-6">
                <AnimatePresence mode="sync">
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      isWishlisted={isWishlisted(product.id)}
                      onWishlistToggle={toggleWishlist}
                      onHover={handleProductLinkHover}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>

        {/* ── Editorial Spotlight ── */}
        <EditorialSpotlight />

        {/* ── Recently Viewed ── */}
        <RecentlyViewedCarousel items={recentlyViewed} />

      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ShopPage;
