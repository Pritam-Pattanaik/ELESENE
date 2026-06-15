import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const useCustomerAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Login failed');
          set({ token: data.token, user: data.user, isAuthenticated: true, loading: false });
          return data;
        } catch (err) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      register: async (full_name, email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Registration failed');
          set({ token: data.token, user: data.user, isAuthenticated: true, loading: false });
          return data;
        } catch (err) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),

      getToken: () => get().token,
    }),
    {
      name: 'elesene-customer-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useCustomerAuthStore;
