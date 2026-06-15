import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useUiStore from '../../store/uiStore';
import useCartStore from '../../store/cartStore';

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUiStore();
  const { items, getCartTotal, removeFromCartOptimistic, updateQuantityOptimistic } = useCartStore();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCart]);

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
            className="fixed inset-0 bg-noir/70 backdrop-blur-md z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md glass-dark z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-futura font-medium text-ivory tracking-wider uppercase">Your Bag <span className="text-gold">({items.length})</span></h2>
              <button onClick={closeCart} className="text-ivory/40 hover:text-gold transition-colors text-2xl leading-none">
                &times;
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-ivory/30 space-y-4">
                  <div className="w-16 h-16 border border-white/[0.06] rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-sm font-futura">Your bag is empty.</p>
                  <button onClick={closeCart} className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold hover:text-gold-light transition-colors">Continue Shopping</button>
                </div>
              ) : (
                items.map((item) => {
                  const price = item.ProductVariant?.additional_price 
                    ? Number(item.Product?.base_price || 0) + Number(item.ProductVariant?.additional_price)
                    : Number(item.Product?.base_price || 0);

                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-28 bg-white/[0.03] rounded-sm overflow-hidden flex-shrink-0">
                        {item.Product?.images?.[0] && (
                          <img src={item.Product.images[0].image_url?.startsWith('http') ? item.Product.images[0].image_url : `http://localhost:3000${item.Product.images[0].image_url}`} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-futura text-sm font-medium text-ivory/80 line-clamp-2">{item.Product?.name}</h3>
                            <button 
                              onClick={() => removeFromCartOptimistic(item.id)}
                              className="text-ivory/20 hover:text-rose transition-colors ml-2"
                            >
                              &times;
                            </button>
                          </div>
                          <p className="text-[10px] font-futura text-ivory/30 mt-1 tracking-wider uppercase">
                            {item.ProductVariant?.color} / {item.ProductVariant?.size}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-end mt-3">
                          <div className="flex items-center border border-white/[0.08] rounded-sm">
                            <button 
                              onClick={() => updateQuantityOptimistic(item.id, Math.max(1, item.quantity - 1))}
                              className="px-3 py-1 text-ivory/50 hover:text-gold transition-colors text-sm"
                            >-</button>
                            <span className="px-2 text-xs text-ivory font-futura">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantityOptimistic(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-ivory/50 hover:text-gold transition-colors text-sm"
                            >+</button>
                          </div>
                          <p className="font-futura text-sm text-gold">₹{(price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/[0.06] space-y-4">
                <div className="flex justify-between text-sm font-futura text-ivory/60">
                  <span className="uppercase tracking-wider">Subtotal</span>
                  <span className="text-gold text-base font-medium">₹{getCartTotal().toLocaleString()}</span>
                </div>
                <p className="text-[9px] text-ivory/20 text-center font-futura tracking-wider">Shipping & taxes calculated at checkout.</p>
                <a 
                  href="/checkout"
                  className="block w-full py-4 bg-gradient-to-r from-gold via-gold-light to-gold text-noir text-center text-[11px] font-futura font-bold uppercase tracking-[0.3em] hover:from-gold-light hover:to-gold transition-all rounded-sm"
                >
                  Secure Checkout
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
