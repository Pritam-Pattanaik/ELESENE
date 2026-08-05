import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWishlist, addToWishlist, removeFromWishlistByProduct, removeFromWishlist } from '../api/user';
import { getCustomerToken } from '../api/authHelper';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlistIds: [],
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        const token = getCustomerToken();
        if (!token) {
          if (get().wishlistIds.length > 0 || get().items.length > 0) {
            set({ wishlistIds: [], items: [], isLoading: false });
          }
          return;
        }

        set({ isLoading: true });

        try {
          const data = await getWishlist();
          if (Array.isArray(data)) {
            const ids = data.map(item => String(item.product_id || item.Product?.id || item.id));
            set({ items: data, wishlistIds: ids, isLoading: false });
          } else {
            set({ items: [], wishlistIds: [], isLoading: false });
          }
        } catch (err) {
          console.warn('Failed to fetch wishlist from server:', err);
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (productId, navigate = null, currentPath = '/shop') => {
        const token = getCustomerToken();

        if (!token) {
          if (navigate) {
            navigate('/auth', {
              state: {
                from: currentPath,
                message: 'Please sign in or register to add items to your wishlist.'
              }
            });
          }
          return false;
        }

        const strId = String(productId);
        const currentIds = get().wishlistIds;
        const isCurrentlyWishlisted = currentIds.includes(strId);

        // Optimistic UI update — turns heart RED / UNCHECKED instantly
        const nextIds = isCurrentlyWishlisted
          ? currentIds.filter(id => id !== strId)
          : [...currentIds, strId];

        set({ wishlistIds: nextIds });

        try {
          if (isCurrentlyWishlisted) {
            await removeFromWishlistByProduct(productId);
          } else {
            await addToWishlist(productId);
          }
          return true;
        } catch (err) {
          console.error('Failed to sync wishlist action with server:', err);
          // Rollback on genuine error
          set({ wishlistIds: currentIds });
          return false;
        }
      },

      removeItemById: async (wishlistItemId) => {
        const currentItems = get().items;
        const targetItem = currentItems.find(i => i.id === wishlistItemId);
        const prodId = targetItem ? String(targetItem.product_id || targetItem.Product?.id) : null;

        if (targetItem) {
          set({
            items: currentItems.filter(i => i.id !== wishlistItemId),
            wishlistIds: prodId ? get().wishlistIds.filter(id => id !== prodId) : get().wishlistIds
          });
        }

        try {
          await removeFromWishlist(wishlistItemId);
        } catch (err) {
          console.error('Failed to remove wishlist item:', err);
          get().fetchWishlist();
        }
      },

      isWishlisted: (productId) => {
        if (!productId) return false;
        return get().wishlistIds.includes(String(productId));
      },

      clearWishlist: () => set({ wishlistIds: [], items: [] })
    }),
    {
      name: 'elesene-wishlist-storage',
      partialize: (state) => ({ wishlistIds: state.wishlistIds })
    }
  )
);

export default useWishlistStore;
