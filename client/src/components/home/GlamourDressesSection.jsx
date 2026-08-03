import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../../api/products';
import { getImageUrl } from '../../utils/imageUrl';
import useWishlistStore from '../../store/wishlistStore';

const products = [
  { img: '/glamour-dresses/dress-1.jpg', name: 'Red Satin Gown',        price: '₹2,999' },
  { img: '/glamour-dresses/dress-2.jpg', name: 'Black Cut-out Dress',   price: '₹2,499' },
  { img: '/glamour-dresses/dress-3.jpg', name: 'Ruched Mini Dress',     price: '₹1,899' },
  { img: '/glamour-dresses/dress-4.jpg', name: 'Burgundy Sequin Dress', price: '₹4,299' },
  { img: '/glamour-dresses/dress-5.jpg', name: 'Off Shoulder Dress',    price: '₹2,699' },
  { img: '/glamour-dresses/dress-6.jpg', name: 'Lace Corset Dress',     price: '₹2,399' },
];

const GlamourDressesSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useProducts({ limit: 6, is_featured: true, sort: 'newest' });
  const wishlistIds = useWishlistStore(s => s.wishlistIds);
  const toggleWishlistStore = useWishlistStore(s => s.toggleWishlist);
  const fetchedProducts = data?.products || products;

  useEffect(() => {
    useWishlistStore.getState().fetchWishlist();
  }, []);
  
  const isWishlisted = (id) => {
    if (!id) return false;
    return wishlistIds.includes(String(id));
  };
  
  // Duplicate for seamless infinite loop if we have products
  const track = [...fetchedProducts, ...fetchedProducts];

  return (
    <section className="py-14 md:py-20 overflow-hidden" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">

        {/* ── Header Row ── */}
        <div className="mb-8 md:mb-10 flex items-end justify-between gap-4">
          <div className="text-left">
            <span className="text-[9px] font-futura tracking-[0.3em] uppercase text-gold font-bold block mb-2">
              Curated Selection
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-ivory uppercase">
              Glamour Dresses
            </h2>
            <p className="mt-2 text-sm text-ivory/55 font-futura font-light">
              Curated to make you stand out.
            </p>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/shop"
              className="hidden sm:flex rounded-full border border-black/15 bg-white px-5 py-2.5 text-[10px] font-futura font-bold tracking-[0.15em] uppercase text-ivory transition-all duration-300 hover:border-gold hover:text-gold hover:bg-white"
            >
              VIEW ALL
            </Link>
            <Link
              to="/shop"
              aria-label="Browse all glamour dresses"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white text-ivory transition-all duration-300 hover:border-gold hover:text-gold"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Marquee Track (full bleed) ── */}
      <div className="glamour-marquee group relative overflow-hidden">
        <div className="glamour-marquee-track flex gap-5 w-max px-3">
          {track.map((p, i) => {
            const imgUrl = p.images?.[0]?.image_url ? getImageUrl(p.images[0].image_url) : p.img;
            const price = p.base_price ? `₹${Number(p.base_price).toLocaleString('en-IN')}` : p.price;
            return (
              <div key={i} className="w-[200px] sm:w-[230px] md:w-[260px] shrink-0 group/card relative">
                {/* Image Block */}
                <div className="overflow-hidden rounded-2xl border border-black/5 shadow-sm bg-white/60 relative">
                  <Link to={p.slug ? `/product/${p.slug}` : '#'}>
                    <img
                      src={imgUrl}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-[280px] sm:h-[320px] md:h-[360px] w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                    />
                  </Link>

                  {/* Wishlist Heart Button */}
                  {p.id && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlistStore(p.id, navigate, location.pathname); }}
                      aria-label={isWishlisted(p.id) ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm shadow flex items-center justify-center transition-all duration-200 cursor-pointer z-10 ${
                        isWishlisted(p.id) ? 'bg-amber-50 text-red-500' : 'bg-white/90 text-ivory/40 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isWishlisted(p.id) ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Caption */}
                <div className="mt-3 text-left px-0.5">
                  <Link to={p.slug ? `/product/${p.slug}` : '#'}>
                    <h3 className="text-sm font-futura font-medium text-ivory tracking-wide leading-snug hover:text-gold transition-colors">{p.name}</h3>
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-ivory font-futura">{price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GlamourDressesSection;
