import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useUiStore from '../../store/uiStore';
import useCartStore from '../../store/cartStore';
import useFocusTrap from '../../hooks/useFocusTrap';
import EmptyState from '../common/EmptyState';
import { updateCartItem, removeFromCart, fetchCart } from '../../api/cart';
import { getImageUrl } from '../../utils/imageUrl';

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUiStore();
  const { items, getCartTotal, removeFromCartOptimistic, updateQuantityOptimistic, syncFromServer } = useCartStore();
  const drawerRef = useFocusTrap(isCartOpen, closeCart);

  // Per-item loading states (id -> 'updating' | 'deleting' | null)
  const [itemLoading, setItemLoading] = useState({});
  const [syncError, setSyncError] = useState(null);

  // Sync server cart when drawer opens
  useEffect(() => {
    if (!isCartOpen) return;
    let cancelled = false;

    const syncCart = async () => {
      try {
        const data = await fetchCart();
        if (!cancelled && data?.success && data.cart?.CartItems) {
          syncFromServer(data.cart.CartItems);
        }
      } catch {
        // Silently fail — local optimistic state is still shown
      }
    };

    syncCart();
    return () => { cancelled = true; };
  }, [isCartOpen, syncFromServer]);

  const isItemLoading = (id, type) => itemLoading[id] === type;

  const handleQuantityChange = async (item, newQty) => {
    if (newQty < 1) return;
    const id = item.id;
    const isTemp = String(id).startsWith('temp-');

    // Always optimistic update
    updateQuantityOptimistic(id, newQty);

    if (!isTemp) {
      setItemLoading(prev => ({ ...prev, [id]: 'updating' }));
      try {
        await updateCartItem(id, { quantity: newQty });
      } catch (err) {
        console.warn('Failed to update quantity on server:', err);
        // Rollback
        updateQuantityOptimistic(id, item.quantity);
        setSyncError('Failed to update quantity. Please try again.');
        setTimeout(() => setSyncError(null), 3000);
      } finally {
        setItemLoading(prev => ({ ...prev, [id]: null }));
      }
    }
  };

  const handleRemove = async (item) => {
    const id = item.id;
    const isTemp = String(id).startsWith('temp-');

    // Always optimistic
    removeFromCartOptimistic(id);

    if (!isTemp) {
      setItemLoading(prev => ({ ...prev, [id]: 'deleting' }));
      try {
        await removeFromCart(id);
      } catch (err) {
        console.warn('Failed to remove item on server:', err);
        // Rollback: re-add the item (put it back in the front)
        useCartStore.getState().addToCartOptimistic(item.Product, item.ProductVariant, item.quantity);
        setSyncError('Failed to remove item. Please try again.');
        setTimeout(() => setSyncError(null), 3000);
      } finally {
        setItemLoading(prev => ({ ...prev, [id]: null }));
      }
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] touch-none"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart Drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f0f12] text-white border-l border-neutral-800 z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950">
              <h2 className="text-lg font-bold text-white tracking-wider uppercase">
                Your Bag <span className="text-amber-400">({items.length})</span>
              </h2>
              <button 
                onClick={closeCart} 
                aria-label="Close cart drawer"
                className="text-neutral-400 hover:text-white transition-colors text-2xl leading-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md"
              >
                &times;
              </button>
            </div>

            {/* Sync error toast */}
            <AnimatePresence>
              {syncError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-futura rounded-xl"
                >
                  {syncError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  }
                  title="Your Bag is Empty"
                  description="Explore our haute couture releases, signature dresses, and luxury accessories to begin your collection."
                  primaryAction={{
                    label: "Explore Collection",
                    onClick: closeCart,
                    to: "/shop"
                  }}
                  className="py-10 bg-transparent border-none shadow-none text-neutral-300"
                />
              ) : (
                items.map((item) => {
                  const price = item.ProductVariant?.additional_price 
                    ? Number(item.Product?.base_price || 0) + Number(item.ProductVariant?.additional_price)
                    : Number(item.Product?.base_price || 0);

                  const imgUrl = item.Product?.images?.[0]?.image_url;
                  const fullImgUrl = imgUrl ? getImageUrl(imgUrl) : null;
                  const isTemp = String(item.id).startsWith('temp-');
                  const isUpdating = isItemLoading(item.id, 'updating');
                  const isDeleting = isItemLoading(item.id, 'deleting');
                  const isBusy = isUpdating || isDeleting;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: isDeleting ? 0.4 : 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex gap-4 ${isBusy ? 'pointer-events-none' : ''}`}
                    >
                      {/* Product Image */}
                      <Link
                        to={`/product/${item.Product?.slug || '#'}`}
                        onClick={closeCart}
                        className="w-20 h-28 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-800 block hover:opacity-80 transition-opacity"
                        tabIndex={isBusy ? -1 : 0}
                      >
                        {fullImgUrl && (
                          <img 
                            src={fullImgUrl} 
                            alt={item.Product?.name ? `${item.Product.name} thumbnail` : 'Cart product item'} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </Link>
                      
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start">
                            <Link
                              to={`/product/${item.Product?.slug || '#'}`}
                              onClick={closeCart}
                              className="flex-1 focus-visible:outline-none"
                            >
                              <h3 className="font-futura text-sm font-bold text-white line-clamp-2 hover:text-amber-400 transition-colors">
                                {item.Product?.name}
                              </h3>
                            </Link>
                            <button 
                              onClick={() => handleRemove(item)}
                              disabled={isBusy}
                              aria-label={`Remove ${item.Product?.name || 'item'} from cart`}
                              className="text-neutral-400 hover:text-red-400 transition-colors ml-2 cursor-pointer text-lg leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-30"
                            >
                              {isDeleting ? (
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-red-500 rounded-full animate-spin" />
                              ) : '×'}
                            </button>
                          </div>
                          <p className="text-[11px] font-futura text-neutral-300 mt-1 tracking-wider uppercase font-medium">
                            {item.ProductVariant?.color || item.color || item.selectedColor || 'Classic'} / {item.ProductVariant?.size || item.size || item.selectedSize || 'Standard'}
                          </p>
                          {isTemp && (
                            <p className="text-[10px] font-futura text-amber-400/80 mt-0.5 font-medium">
                              Sign in to save to cloud
                            </p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-end mt-3">
                          <div className="flex items-center border border-stone-800 rounded-lg bg-neutral-900">
                            <button 
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isBusy}
                              aria-label={`Decrease quantity of ${item.Product?.name || 'item'}`}
                              className="px-3 py-1 text-neutral-300 hover:text-amber-400 transition-colors text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-30"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs text-white font-futura font-bold min-w-[24px] text-center">
                              {isUpdating ? (
                                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-amber-400 rounded-full animate-spin" />
                              ) : item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              disabled={isBusy}
                              aria-label={`Increase quantity of ${item.Product?.name || 'item'}`}
                              className="px-3 py-1 text-neutral-300 hover:text-amber-400 transition-colors text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-futura text-sm text-amber-400 font-bold font-mono">
                            ₹{(price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-stone-800 space-y-4 bg-neutral-950">
                <div className="flex justify-between text-sm font-futura text-white">
                  <span className="uppercase tracking-wider font-bold">Subtotal</span>
                  <span className="text-amber-400 text-base font-bold font-mono">
                    ₹{getCartTotal().toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 text-center font-futura tracking-wider font-medium">
                  Shipping &amp; taxes calculated at checkout.
                </p>
                <Link 
                  to="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-black font-bold text-[11px] font-futura uppercase tracking-[0.25em] transition-all rounded-xl shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  style={{ minHeight: '52px' }}
                >
                  Secure Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
