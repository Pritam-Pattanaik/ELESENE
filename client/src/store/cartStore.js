import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      sessionId: null,

      setSessionId: (id) => set({ sessionId: id }),
      
      setItems: (items) => set({ items }),

      addToCartOptimistic: (product, variant, quantity) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.product_id === product.id && item.variant_id === variant.id
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === existingItem.id ? { ...item, quantity: item.quantity + quantity } : item
            )
          });
        } else {
          set({
            items: [
              ...currentItems,
              { 
                id: `temp-${Date.now()}`, 
                product_id: product.id, 
                variant_id: variant.id, 
                quantity,
                Product: product,
                ProductVariant: variant
              }
            ]
          });
        }
      },

      removeFromCartOptimistic: (cartItemId) => {
        set({
          items: get().items.filter(item => item.id !== cartItemId)
        });
      },
      
      updateQuantityOptimistic: (cartItemId, newQuantity) => {
        set({
          items: get().items.map(item => 
            item.id === cartItemId ? { ...item, quantity: newQuantity } : item
          )
        });
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.ProductVariant?.additional_price 
            ? Number(item.Product?.base_price || 0) + Number(item.ProductVariant?.additional_price || 0)
            : Number(item.Product?.base_price || 0);
          return total + (price * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'elesene-cart-storage',
      partialize: (state) => ({ sessionId: state.sessionId }), // Only persist session ID
    }
  )
);

export default useCartStore;
