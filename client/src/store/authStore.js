import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (updatedFields) => {
        set((state) => ({ user: state.user ? { ...state.user, ...updatedFields } : null }));
      },

      getToken: () => get().token,

      isAdmin: () => {
        const user = get().user;
        return user && (user.role === 'admin' || user.role === 'superadmin');
      },

      isSuperAdmin: () => {
        const user = get().user;
        return user && user.role === 'superadmin';
      },
    }),
    {
      name: 'elesene-admin-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
