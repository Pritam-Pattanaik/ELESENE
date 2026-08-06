import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../../api/products';
import useCartStore from '../../store/cartStore';
import useUiStore from '../../store/uiStore';
import useCustomerAuthStore from '../../store/customerAuthStore';
import useWishlistStore from '../../store/wishlistStore';
import { addToCart, fetchCart } from '../../api/cart';
import { getImageUrl } from '../../utils/imageUrl';

/* ─── CATEGORIES DATA ────────────────────────────────────────── */
const categories = [
  { id: 1, name: 'Dresses',      slug: 'evening-wear',  img: '/images/fashion-dress.jpg' },
  { id: 2, name: 'Bridal',       slug: 'bridal',        img: '/images/fashion-gown.jpg' },
  { id: 3, name: 'Gowns',        slug: 'evening-wear',  img: '/images/fashion-sundress.jpg' },
  { id: 4, name: 'Accessories',  slug: 'accessories',   img: '/images/fashion-bag.jpg' },
  { id: 5, name: 'Prêt-à-Porter', slug: 'pret-a-porter', img: '/images/fashion-red-suit.jpg' },
  { id: 6, name: 'Shoes',        slug: 'shoes',         img: '/images/fashion-boots.jpg' },
];

/* ─── COMPONENT ──────────────────────────────────────────────── */
const CollectionsAndNewArrivals = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addedItemMap, setAddedItemMap] = useState({});
  const catScrollRef = useRef(null);

  const { data: productsData, isLoading } = useProducts({ limit: 5, sort: 'newest' });
  const { addToCartOptimistic, syncFromServer } = useCartStore();
  const { openCart } = useUiStore();
  const { isAuthenticated } = useCustomerAuthStore();
  const wishlistIds = useWishlistStore(s => s.wishlistIds);
  const toggleWishlistStore = useWishlistStore(s => s.toggleWishlist);

  const products = productsData?.products || [];

  // Wishlist state is initialized by the auth store on login.
  // Components only read from the store — no per-component fetch needed.

  const toggleWishlist = (id) => {
    return toggleWishlistStore(id, navigate, location.pathname);
  };

  const isWishlisted = (id) => {
    if (!id) return false;
    return wishlistIds.includes(String(id));
  };

  const scrollCat = (dir) => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location.pathname, message: 'Please sign in or register to add items to your bag.' } });
      return;
    }

    const variant = product.variants?.[0] || { id: null, size: 'Standard', color: 'Default' };

    // Instant optimistic update
    addToCartOptimistic(product, variant, 1);
    setAddedItemMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => { openCart(); }, 350);

    // Server sync for both authenticated and guest users
    try {
      await addToCart({ product_id: product.id, variant_id: variant.id, quantity: 1 });
      const cartRes = await fetchCart();
      if (cartRes?.success && cartRes.cart?.CartItems) {
        syncFromServer(cartRes.cart.CartItems);
      }
    } catch {
      // Silently ignore
    }
  };

  return (
    <section id="collections" className="bg-[#FAF9F6] py-16 md:py-24 border-t border-black/[0.06]">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 space-y-16 md:space-y-20">

        {/* ══════════════ A. EXPLORE OUR COLLECTIONS ══════════════ */}
        <div>
          {/* Section header */}
          <div className="flex items-start justify-between gap-4 mb-7">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#111]">
                EXPLORE OUR COLLECTIONS
              </h2>
              <p className="text-xs text-[#888] mt-1 font-futura">Handpicked styles for every mood.</p>
            </div>
            {/* Arrow nav */}
            <div className="flex gap-2 shrink-0 mt-1">
              <button
                onClick={() => scrollCat(-1)}
                aria-label="Previous categories"
                className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center text-[#555] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors duration-300 text-sm cursor-pointer"
              >
                ‹
              </button>
              <button
                onClick={() => scrollCat(1)}
                aria-label="Next categories"
                className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center text-[#555] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors duration-300 text-sm cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>

          {/* Category cards */}
          <div
            ref={catScrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 md:overflow-x-visible md:grid md:grid-cols-6 scrollbar-hide"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative shrink-0 w-[150px] sm:w-[170px] md:w-auto snap-start overflow-hidden rounded-xl border border-black/5 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#e8e8e3]">
                  <img
                    src={cat.img}
                    alt={`${cat.name} collection`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-3 py-3 text-left">
                  <span className="block text-[10px] font-futura font-bold tracking-[0.18em] text-white uppercase leading-tight">
                    {cat.name}
                  </span>
                  <span className="block text-[9px] font-futura text-white/70 tracking-widest mt-0.5 uppercase">
                    Explore
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════ B. JUST IN ══════════════ */}
        <div>
          {/* Section header */}
          <div className="flex items-end justify-between gap-4 mb-7">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#111]">
                JUST IN
              </h2>
              <p className="text-xs text-[#888] mt-1 font-futura">The latest styles you&apos;ll love</p>
            </div>
            <Link
              to="/shop"
              className="text-[10px] font-futura font-bold tracking-[0.2em] uppercase text-[#555] hover:text-[#C9A84C] transition-colors duration-300 flex items-center gap-1 group shrink-0"
            >
              VIEW ALL
              <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Product cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-black/5 rounded-xl animate-pulse" />
              ))
            ) : (
              products.map((item, index) => {
                const JUST_IN_FALLBACK_IMAGES = [
                  '/images/fashion-red-suit.jpg',
                  '/images/fashion-organza-blouse.jpg',
                  '/images/fashion-chunky-knit.jpg',
                  '/images/fashion-noir-set.jpg',
                  '/images/fashion-embroidered-blouse.jpg',
                  '/images/fashion-gown.jpg',
                  '/images/fashion-coat.jpg',
                  '/images/fashion-dress.jpg',
                  '/images/fashion-suit.jpg',
                  '/images/fashion-cardigan.jpg'
                ];
                const img = item.images?.[0]?.image_url;
                const isUnsplashOrEmpty = !img || img.includes('unsplash.com');
                const fullImgUrl = !isUnsplashOrEmpty
                  ? getImageUrl(img)
                  : JUST_IN_FALLBACK_IMAGES[index % JUST_IN_FALLBACK_IMAGES.length];
                const isAdded = addedItemMap[item.id];

                return (
                  <div key={item.id} className="group flex flex-col">
                    {/* Image block */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-black/5 bg-[#ece9e3] shadow-sm hover:shadow-md transition-shadow duration-300">
                      {/* Image link — does NOT cover the full card height, stops below action buttons */}
                      <Link to={`/product/${item.slug}`} className="block absolute inset-0 z-0" tabIndex={-1} aria-hidden="true">
                        <img
                          src={fullImgUrl}
                          alt={`${item.name} product photo`}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      </Link>

                      {/* Clickable overlay for full card navigation (lowest priority) */}
                      <Link
                        to={`/product/${item.slug}`}
                        className="absolute inset-0 z-[1]"
                        aria-label={`View ${item.name}`}
                      />

                      {/* NEW badge */}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[8px] font-futura font-bold tracking-widest uppercase rounded bg-[#111] text-white shadow-sm pointer-events-none z-[3]">
                        NEW
                      </span>

                      {/* Action buttons — wishlist + cart, above the link overlay */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-[4]">
                        {/* Wishlist */}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item.id); }}
                          aria-label={isWishlisted(item.id) ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
                          className={`w-7 h-7 rounded-full glass-hover shadow flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] ${
                            isWishlisted(item.id) ? 'glass-gold' : 'glass-md'
                          }`}
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-colors duration-200 ${isWishlisted(item.id) ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#555]'}`}
                            fill={isWishlisted(item.id) ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </button>

                        {/* Direct Add to Cart button */}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickAdd(e, item); }}
                          aria-label={`Add ${item.name} to bag`}
                          className={`w-7 h-7 rounded-full shadow flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            isAdded
                              ? 'bg-green-600 text-white'
                              : 'glass-md glass-hover hover:!bg-[#C9A84C]/20 hover:!border-[#C9A84C]/50 text-[#555] hover:text-[#C9A84C]'
                          }`}
                        >
                          {isAdded ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Product meta */}
                    <div className="mt-2.5 text-left px-0.5">
                      <Link to={`/product/${item.slug}`} className="block group-hover:text-[#C9A84C] transition-colors duration-300">
                        <h3 className="text-[12.5px] font-futura font-medium text-[#1C1C1C] tracking-wide leading-snug truncate">
                          {item.name}
                        </h3>
                        <p className="text-[12.5px] font-futura font-semibold text-[#1C1C1C] mt-0.5">
                          ₹{Number(item.base_price || 0).toLocaleString('en-IN')}
                        </p>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CollectionsAndNewArrivals;
