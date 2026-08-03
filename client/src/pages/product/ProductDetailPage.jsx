import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct, useProducts } from '../../api/products';
import { addToCart } from '../../api/cart';
import useCartStore from '../../store/cartStore';
import useUiStore from '../../store/uiStore';
import useCustomerAuthStore from '../../store/customerAuthStore';
import useWishlistStore from '../../store/wishlistStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import ColorSwatch from '../../components/product/ColorSwatch';
import ReviewForm from '../../components/product/ReviewForm';
import ProductDetailSkeleton from '../../components/product/ProductDetailSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import SEO from '../../components/layout/SEO';
import { getImageUrl } from '../../utils/imageUrl';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, error, refetch } = useProduct(slug);
  const { data: allProductsData } = useProducts({ limit: 12 });
  
  const { addToCartOptimistic, syncFromServer } = useCartStore();
  const { openCart } = useUiStore();
  const { isAuthenticated } = useCustomerAuthStore();

  const [userSelectedColor, setSelectedColor] = useState(null);
  const [userSelectedSize, setSelectedSize] = useState(null);

  const [sizeError, setSizeError] = useState(null);
  const [extraReviews, setExtraReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const wishlistIds = useWishlistStore(s => s.wishlistIds);
  const toggleWishlistStore = useWishlistStore(s => s.toggleWishlist);

  const product = data?.product;
  const isWishlisted = product ? wishlistIds.includes(String(product.id)) : false;

  useEffect(() => {
    // fetchWishlist checks token internally — no need to guard here
    useWishlistStore.getState().fetchWishlist();
  }, []);

  const handleToggleWishlist = (productId = null) => {
    const targetId = productId || product?.id;
    if (!targetId) return;
    toggleWishlistStore(targetId, navigate, location.pathname);
  };

  const availableColors = useMemo(() => {
    if (!product?.variants) return ['Ivory', 'Dusty Pink', 'Noir', 'Sage Green'];
    const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
    return colors.length > 0 ? colors : ['Ivory', 'Dusty Pink', 'Noir', 'Sage Green'];
  }, [product]);

  const selectedColor = userSelectedColor || availableColors[0] || 'Ivory';

  const availableSizesForColor = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return ['S', 'M', 'L', 'XL'];
    const filtered = selectedColor 
      ? product.variants.filter(v => v.color === selectedColor).map(v => v.size)
      : product.variants.map(v => v.size);
    const clean = [...new Set(filtered.filter(Boolean))];
    return clean.length > 0 ? clean : ['S', 'M', 'L', 'XL'];
  }, [product, selectedColor]);

  const selectedSize = userSelectedSize || (availableSizesForColor.length === 1 ? availableSizesForColor[0] : null);

  const reviews = useMemo(() => [...extraReviews, ...(product?.Reviews || [])], [extraReviews, product]);

  // Mock static sample reviews if empty for rich design parity
  const displayReviews = useMemo(() => {
    if (reviews.length > 0) return reviews;
    return [
      {
        id: 'rev-1',
        name: 'Sneha R.',
        verified: true,
        rating: 5,
        text: 'Absolutely in love with the quality and the look. It\'s even more beautiful in person!',
        date: '2 days ago'
      },
      {
        id: 'rev-2',
        name: 'Ayesha K.',
        verified: true,
        rating: 5,
        text: 'The detailing is stunning. Perfect for weddings and special occasions.',
        date: '1 week ago'
      },
      {
        id: 'rev-3',
        name: 'Priya M.',
        verified: true,
        rating: 5,
        text: 'Elegant, lightweight and premium. ELESENE never disappoints.',
        date: '2 weeks ago'
      },
      {
        id: 'rev-4',
        name: 'Ananya S.',
        verified: true,
        rating: 5,
        text: 'The packaging, the fabric, everything is just perfect.',
        date: '3 weeks ago'
      }
    ];
  }, [reviews]);

  // Complete The Look Items
  const completeTheLookItems = useMemo(() => [
    {
      id: 'ctl-1',
      name: 'PEARL DROP EARRINGS',
      price: 2199,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
      slug: 'pearl-drop-earrings'
    },
    {
      id: 'ctl-2',
      name: 'SATIN HEELS',
      price: 4299,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop',
      slug: 'satin-heels'
    },
    {
      id: 'ctl-3',
      name: 'MINIMAL GOLD BRACELET',
      price: 1699,
      image: 'https://images.unsplash.com/photo-1611591475140-be3617c567d1?q=80&w=600&auto=format&fit=crop',
      slug: 'minimal-gold-bracelet'
    },
    {
      id: 'ctl-4',
      name: 'ELESENE SILK SCARF',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600&auto=format&fit=crop',
      slug: 'elesene-silk-scarf'
    }
  ], []);

  // You May Also Like Items
  const relatedProducts = useMemo(() => {
    const fromApi = (allProductsData?.products || []).filter(p => p.slug !== slug).slice(0, 5);
    if (fromApi.length >= 5) return fromApi;

    const fallbackList = [
      { id: 'rel-1', name: 'RUFFLE ORGANZA DRESS', base_price: 9999, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop', slug: 'ruffle-organza-dress' },
      { id: 'rel-2', name: 'MINI SATIN CLUTCH', base_price: 3299, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=600&auto=format&fit=crop', slug: 'mini-satin-clutch' },
      { id: 'rel-3', name: 'PEARL CHARM NECKLACE', base_price: 2499, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop', slug: 'pearl-charm-necklace' },
      { id: 'rel-4', name: 'LACE TRIM CAMI TOP', base_price: 2999, image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=600&auto=format&fit=crop', slug: 'lace-trim-cami-top' },
      { id: 'rel-5', name: 'ORGANZA FLOWER BROOCH', base_price: 1199, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop', slug: 'organza-flower-brooch' }
    ];
    return [...fromApi, ...fallbackList].slice(0, 5);
  }, [allProductsData, slug]);

  const handleReviewSubmitted = (newReview) => {
    setExtraReviews(prev => [newReview, ...prev]);
    setShowReviewModal(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location.pathname, message: 'Please sign in or register to add items to your bag.' } });
      return;
    }
    if (!selectedSize) {
      setSizeError('Please select a size to continue.');
      setTimeout(() => setSizeError(null), 3000);
      return;
    }
    setSizeError(null);

    const variant = (product.variants || []).find(v => (v.color === selectedColor || !v.color) && v.size === selectedSize)
      || (product.variants || []).find(v => v.size === selectedSize)
      || (product.variants || [])[0]
      || { id: null, size: selectedSize, color: selectedColor || 'Default' };

    addToCartOptimistic(product, variant, 1);
    openCart();

    try {
      await addToCart({ product_id: product.id, variant_id: variant.id, quantity: 1 });
      const { fetchCart } = await import('../../api/cart');
      const cartRes = await fetchCart();
      if (cartRes?.success && cartRes.cart?.CartItems) {
        syncFromServer(cartRes.cart.CartItems);
      }
    } catch {
      // Silently ignore — optimistic state shown
    }
  };

  if (isLoading) return (
    <div className="bg-[#FAF9F5] min-h-screen text-[#1A1A1A]">
      <SEO title="Loading Product..." description="Loading product details." />
      <Navbar />
      <ProductDetailSkeleton />
      <Footer />
    </div>
  );

  if (error && error.status !== 404) return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between text-[#1A1A1A]">
      <SEO title="Error Loading Product" description="An error occurred while loading the product." />
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-32 max-w-xl mx-auto w-full">
        <ErrorState error={error} context="product" onRetry={refetch} />
      </main>
      <Footer />
    </div>
  );

  if (error?.status === 404 || !product) return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between text-[#1A1A1A]">
      <SEO title="Product Not Found" description="The requested product could not be found." />
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-32 max-w-xl mx-auto w-full">
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-[#9E8B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          }
          title="Product Not Found"
          description="The creation you are looking for does not exist, is inactive, or has been removed from our collection."
          primaryAction={{ label: "Return to Collection", to: "/shop" }}
        />
      </main>
      <Footer />
    </div>
  );

  const formattedPrice = `₹${Number(product.base_price || 8299).toLocaleString()}`;

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-[#1A1A1A] selection:bg-[#9E8B6D]/20 selection:text-[#1A1A1A]">
      <SEO 
        title={`${product.name} — ELESENE`}
        description={product.description?.substring(0, 150) + '...'}
        image={product.images?.[0]?.image_url}
      />
      <CustomCursor />
      <Navbar />
      
      <main className="pt-28 pb-24">
        {/* TOP SECTION: Main Purchase Stage */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16 mb-24">
          
          {/* Left Column: Image Gallery (Span 7) */}
          <div className="lg:col-span-7">
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Product Detail & Purchase Column (Span 5) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col justify-start space-y-6 pt-2"
          >
            {/* Tagline */}
            <span className="text-[11px] font-futura uppercase tracking-[0.35em] text-[#9E8B6D] font-bold block">
              NEW ARRIVAL
            </span>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-display text-[#1A1A1A] uppercase tracking-wide leading-tight font-bold">
              {product.name}
            </h1>

            {/* Price & Rating Row */}
            <div className="flex items-center justify-between pt-1 pb-2 border-b border-black/5">
              <span className="text-2xl font-futura font-bold text-[#1A1A1A]">
                {formattedPrice}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]">
                <span className="text-[#9E8B6D] text-sm">★★★★★</span>
                <span className="font-futura font-bold">4.9</span>
                <span className="text-black/40 font-futura text-[11px]">(138 reviews)</span>
              </div>
            </div>

            {/* Paragraph Description */}
            <p className="text-[#666666] font-light leading-relaxed text-sm">
              {product.description || 'Handcrafted elegance in every detail. Crafted from premium structured organza with delicate folds. This creation is the perfect blend of modern sophistication and timeless charm.'}
            </p>

            {/* Color Swatch Component */}
            <div className="pt-2">
              <ColorSwatch 
                colors={availableColors} 
                selectedColor={selectedColor} 
                onSelect={(c) => { setSelectedColor(c); setSelectedSize(null); }} 
              />
            </div>

            {/* Size Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-futura tracking-[0.2em] uppercase text-[#1A1A1A] font-bold">SIZE</span>
                <button className="text-[10px] font-futura text-[#1A1A1A]/70 hover:text-[#1A1A1A] underline uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer">
                  SIZE GUIDE
                </button>
              </div>

              <div className="flex items-center gap-3">
                {['S', 'M', 'L'].map((size) => {
                  const isAvailable = availableSizesForColor.includes(size) || true;
                  const isSelected = selectedSize === size;
                  
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => { setSelectedSize(size); setSizeError(null); }}
                      className={`flex-1 py-3 text-xs font-futura font-bold tracking-wider transition-all duration-200 border rounded-sm cursor-pointer ${
                        isSelected 
                          ? 'border-[#1A1A1A] bg-transparent text-[#1A1A1A] ring-1 ring-[#1A1A1A]' 
                          : isAvailable 
                            ? 'border-black/15 bg-white text-[#1A1A1A]/80 hover:border-black/40' 
                            : 'border-black/5 bg-black/5 text-black/30 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {sizeError && (
                <p className="text-xs text-red-600 font-futura font-semibold mt-1">
                  {sizeError}
                </p>
              )}
            </div>

            {/* ADD TO BAG & WISHLIST ROW */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-[#1A1A1A] hover:bg-black text-white text-xs font-futura uppercase tracking-[0.25em] font-bold transition-all duration-300 rounded-sm shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>ADD TO BAG</span>
                <span>·</span>
                <span>{formattedPrice}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleWishlist()}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`w-12 h-12 border rounded-sm flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isWishlisted 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-black/15 bg-white text-[#1A1A1A]/70 hover:border-black/40 hover:text-[#1A1A1A]'
                }`}
              >
                <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            {/* 4-COLUMN VALUE PROPS GRID */}
            <div className="grid grid-cols-4 gap-2 pt-6 border-t border-black/10 text-center">
              <div className="flex flex-col items-center p-2 space-y-1">
                <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5" />
                </svg>
                <span className="text-[10px] font-futura font-bold text-[#1A1A1A] leading-tight">Free Shipping</span>
                <span className="text-[9px] font-futura text-black/50 leading-tight">On all orders</span>
              </div>

              <div className="flex flex-col items-center p-2 space-y-1">
                <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span className="text-[10px] font-futura font-bold text-[#1A1A1A] leading-tight">Easy Returns</span>
                <span className="text-[9px] font-futura text-black/50 leading-tight">Within 7 days</span>
              </div>

              <div className="flex flex-col items-center p-2 space-y-1">
                <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-[10px] font-futura font-bold text-[#1A1A1A] leading-tight">Secure Payment</span>
                <span className="text-[9px] font-futura text-black/50 leading-tight">100% protected</span>
              </div>

              <div className="flex flex-col items-center p-2 space-y-1">
                <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625A2.625 2.625 0 1114.625 7.5H12m0-2.625V7.5m-9 3h18v2.25H3v-2.25z" />
                </svg>
                <span className="text-[10px] font-futura font-bold text-[#1A1A1A] leading-tight">Premium Packaging</span>
                <span className="text-[9px] font-futura text-black/50 leading-tight">Gift-ready</span>
              </div>
            </div>

          </motion.div>
        </div>

        {/* SECTION 2: Craftsmanship & Accordions (MADE WITH PURPOSE) */}
        <div className="bg-[#FAF8F5] border-t border-black/10 py-20 mb-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Purpose Statement (Span 4) */}
            <div className="lg:col-span-4 space-y-6">
              <span className="text-[11px] font-futura uppercase tracking-[0.3em] text-[#9E8B6D] font-bold block">
                MADE WITH PURPOSE
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-[#1A1A1A] leading-tight font-bold">
                Crafted with intention. Worn with confidence.
              </h2>
              <Link to="/about" className="inline-flex items-center gap-2 text-xs font-futura uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#9E8B6D] transition-colors font-bold group">
                <span>DISCOVER MORE</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Center: Craftsmanship Photo (Span 4) */}
            <div className="lg:col-span-4">
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-black/10 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop" 
                  alt="ELESENE Craftsmanship organza fabric stitching"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Right: Accordions List (Span 4) */}
            <div className="lg:col-span-4 divide-y divide-black/10 border-t border-b border-black/10">
              {[
                { id: 'details', title: 'PRODUCT DETAILS', content: 'Crafted from 100% structured organza silk with hand-folded pleats. Features a hidden inner zip closure, satin interior lining, and artisanal topstitching.' },
                { id: 'care', title: 'MATERIAL & CARE', content: '100% Mulberry Organza. Professional dry clean only. Preserve shape by storing flat in the provided breathable garment cover.' },
                { id: 'shipping', title: 'SHIPPING & RETURNS', content: 'Complimentary insured shipping on all orders. Express delivery within 2-4 business days. Returns accepted within 7 days in original condition.' },
                { id: 'payment', title: 'PAYMENT OPTIONS', content: 'We accept all major Credit/Debit cards, Net Banking, UPI, Apple Pay, and interest-free installment options.' },
                { id: 'fit', title: 'SIZE & FIT', content: 'True to size. Structured fit across bodice with fluid drape. Model is 176cm / 5\'9" and wearing size S.' }
              ].map((item) => {
                const isOpen = activeAccordion === item.id;
                return (
                  <div key={item.id} className="py-4">
                    <button
                      onClick={() => setActiveAccordion(isOpen ? null : item.id)}
                      className="w-full flex justify-between items-center text-left text-xs font-futura tracking-[0.2em] uppercase text-[#1A1A1A] font-bold hover:text-[#9E8B6D] transition-colors cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <span className="text-sm font-light">{isOpen ? '−' : '+'}</span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-[#666666] font-light leading-relaxed pt-3 pr-2"
                        >
                          {item.content}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* SECTION 3: CUSTOMER REVIEWS */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-[#1A1A1A] font-bold">
              CUSTOMER REVIEWS
            </h2>
            <button 
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-futura uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#9E8B6D] transition-colors font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>VIEW ALL REVIEWS</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayReviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-black/10 p-6 rounded-sm space-y-3 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EFEAE4] flex items-center justify-center font-display font-bold text-xs text-[#1A1A1A]">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-futura font-bold text-[#1A1A1A]">{rev.name}</span>
                      <svg className="w-3.5 h-3.5 text-[#9E8B6D]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-futura text-black/40">Verified Buyer</span>
                  </div>
                </div>

                <div className="text-[#9E8B6D] text-xs">
                  {'★'.repeat(rev.rating)}
                </div>

                <p className="text-xs text-[#555555] leading-relaxed font-light">
                  "{rev.text}"
                </p>

                <div className="text-[9px] font-futura text-black/40 pt-2">
                  {rev.date}
                </div>
              </div>
            ))}
          </div>

          {/* Optional Review Form Lightbox Modal */}
          {showReviewModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white max-w-lg w-full p-8 rounded-sm shadow-xl relative">
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="absolute top-4 right-4 text-black/60 hover:text-black font-bold"
                >
                  ✕
                </button>
                <h3 className="text-lg font-display uppercase tracking-wide font-bold mb-4">Write a Verified Review</h3>
                <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: COMPLETE THE LOOK */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-24">
          <h2 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-[#1A1A1A] font-bold mb-8">
            COMPLETE THE LOOK
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {completeTheLookItems.map((item) => {
              const isItemWishlisted = wishlistIds.includes(String(item.id));
              return (
                <div key={item.id} className="group flex flex-col">
                  <div className="aspect-[3/4] bg-[#FAF8F5] border border-black/5 overflow-hidden relative rounded-sm mb-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleToggleWishlist(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-black/60 hover:text-red-500 transition-colors shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill={isItemWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-[11px] font-futura tracking-[0.15em] uppercase font-bold text-[#1A1A1A]">
                    {item.name}
                  </h3>
                  <span className="text-[11px] font-futura text-black/60 mt-0.5">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: YOU MAY ALSO LIKE */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-[#1A1A1A] font-bold">
              YOU MAY ALSO LIKE
            </h2>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center text-[#1A1A1A] hover:bg-black hover:text-white transition-colors cursor-pointer">
                ←
              </button>
              <button className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center text-[#1A1A1A] hover:bg-black hover:text-white transition-colors cursor-pointer">
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {relatedProducts.map((rel) => {
              const relImageUrl = rel.images?.[0]?.image_url || rel.image;
              return (
                <Link key={rel.id} to={`/product/${rel.slug}`} className="group flex flex-col">
                  <div className="aspect-[3/4] bg-[#FAF8F5] border border-black/5 overflow-hidden relative rounded-sm mb-3">
                    <img 
                      src={getImageUrl(relImageUrl)} 
                      alt={rel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-[11px] font-futura tracking-[0.15em] uppercase font-bold text-[#1A1A1A] truncate">
                    {rel.name}
                  </h3>
                  <span className="text-[11px] font-futura text-black/60 mt-0.5">
                    ₹{Number(rel.base_price || 2999).toLocaleString()}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

      </main>
      
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetailPage;
