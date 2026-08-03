import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useCustomerAuthStore from './customerAuthStore';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      sessionId: null,

      getSessionId: () => {
        let sid = get().sessionId;
        if (!sid) {
          sid = 'session_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
          set({ sessionId: sid });
        }
        return sid;
      },

      setSessionId: (id) => set({ sessionId: id }),
      
      setItems: (items) => set({ items }),

      addToCartOptimistic: (product, variant, quantity) => {
        // Enforce customer authentication: unauthenticated guests cannot add to bag
        if (!useCustomerAuthStore.getState().isAuthenticated) {
          set({ items: [] });
          return;
        }
        // Ensure guest session ID exists
        if (!get().sessionId) {
          get().getSessionId();
        }

        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.product_id === product.id && item.variant_id === (variant?.id || null)
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
                variant_id: variant?.id || null, 
                quantity,
                Product: product,
                ProductVariant: variant || { size: 'Standard', color: 'Default' }
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

      // Merge server cart items into local state, preferring server items
      syncFromServer: (serverItems) => {
        if (!serverItems) return;
        const localItems = get().items;
        // Keep temp items (not yet synced) that aren't already in server response
        const serverProductVariantIds = new Set(
          serverItems.map(i => `${i.product_id}-${i.variant_id}`)
        );
        const tempOnlyItems = localItems.filter(
          item => item.id.startsWith('temp-') && !serverProductVariantIds.has(`${item.product_id}-${item.variant_id}`)
        );
        set({ items: [...serverItems, ...tempOnlyItems] });
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
      partialize: (state) => ({ 
        sessionId: state.sessionId,
        items: state.items  // Persist items so cart survives page refresh
      }),
    }
  )
);

export default useCartStore;
