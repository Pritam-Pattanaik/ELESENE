import { create } from 'zustand';

const useUiStore = create((set) => ({
  isCartOpen: false,
  isMobileNavOpen: false,
  isFilterOpen: false,
  
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  closeCart: () => set({ isCartOpen: false }),
  openCart: () => set({ isCartOpen: true }),
  
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  openMobileNav: () => set({ isMobileNavOpen: true }),

  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  closeFilter: () => set({ isFilterOpen: false }),
  openFilter: () => set({ isFilterOpen: true }),
}));

export default useUiStore;
