import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useUiStore from '../../store/uiStore';
import useCustomerAuthStore from '../../store/customerAuthStore';
import useWishlistStore from '../../store/wishlistStore';
import { useAddToCart } from '../../api/cart';
import { getCustomerToken } from '../../api/authHelper';
import { getImageUrl } from '../../utils/imageUrl';
import { WishlistSkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const WishlistPage = () => {
  const { isAuthenticated } = useCustomerAuthStore();
  const { items: wishlist, isLoading: loading, removeItemById } = useWishlistStore();
  const { openCart } = useUiStore();
  const addToCartMutation = useAddToCart();

  useEffect(() => {
    // fetchWishlist itself checks for token, so just call it on mount
    useWishlistStore.getState().fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    removeItemById(id);
  };

  const handleAddToCart = async (item) => {
    const product = item.Product;
    if (!product) return;
    try {
      await addToCartMutation.mutateAsync({
        product_id: product.id,
        quantity: 1,
        ...(item.variant_id && { variant_id: item.variant_id })
      });
      openCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Use token directly — avoids Zustand hydration race condition
  if (!getCustomerToken() && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: '/account/wishlist' }} replace />;
  }

  if (loading) {
    return <WishlistSkeletonGrid count={6} />;
  }

  if (wishlist.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        }
        title="Your Wishlist is Empty"
        description="Curate your personal collection of haute couture, luxury dresses, and designer releases to review later."
        primaryAction={{
          label: "Explore Collection",
          to: "/shop"
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-ivory tracking-wide">Saved Wishlist</h2>
          <p className="text-xs text-ivory/60 mt-1 font-futura">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const product = item.Product;
          if (!product) return null;

          const basePrice = parseFloat(product.base_price);
          const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
          const displayPrice = salePrice || basePrice;
          const discount = salePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;

          const imageUrl = product.images && product.images.length > 0
            ? getImageUrl(product.images[0].image_url)
            : null;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] bg-black/5 overflow-hidden">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ivory/30">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(item.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-ivory/70 hover:text-red-600 transition-colors duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer border border-black/5"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-futura text-ivory/60 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {product.brand}
                  </span>
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-futura font-bold text-ivory truncate flex-1 mr-2">{product.name}</h3>
                  {salePrice && (
                    <span className="text-[9px] font-futura text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-md">
                      -{discount}%
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-ivory/60 font-futura mb-3 truncate">{product.description || 'Exclusive ELESENE piece'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-futura font-bold text-gold">₹{displayPrice.toLocaleString('en-IN')}</span>
                    {salePrice && (
                      <span className="text-[10px] font-futura text-ivory/50 line-through">₹{basePrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={addToCartMutation.isPending}
                    className="text-[10px] font-futura text-ivory bg-black/5 hover:bg-gold hover:text-noir px-3 py-1.5 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer border border-black/5 uppercase tracking-wider font-bold"
                  >
                    {addToCartMutation.isPending ? 'Adding...' : 'Add to Bag'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;

