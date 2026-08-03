import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabase';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

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

        // 1. Try Supabase Auth
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error && data?.session?.access_token) {
            const mappedUser = {
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || 'Customer',
              phone: data.user.phone || '',
              role: 'customer'
            };
            set({ 
              token: data.session.access_token, 
              user: mappedUser, 
              isAuthenticated: true, 
              loading: false 
            });
            return { token: data.session.access_token, user: mappedUser };
          }
        } catch {
          // Supabase auth failed, falling back to local backend API
        }

        // 2. Express Backend API Fallback
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Invalid email or password');
          }

          set({ 
            token: data.token, 
            user: data.user, 
            isAuthenticated: true, 
            loading: false 
          });
          return { token: data.token, user: data.user };
        } catch (err) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      register: async (full_name, email, password) => {
        set({ loading: true, error: null });

        // 1. Try Supabase Auth
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name } }
          });
          if (!error && data?.session?.access_token) {
            const mappedUser = {
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || full_name,
              phone: data.user.phone || '',
              role: 'customer'
            };
            set({ 
              token: data.session.access_token, 
              user: mappedUser, 
              isAuthenticated: true, 
              loading: false 
            });
            return { token: data.session.access_token, user: mappedUser };
          }
        } catch {
          // Supabase signup failed, falling back to local backend API
        }

        // 2. Express Backend API Fallback
        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Registration failed');
          }

          set({ 
            token: data.token, 
            user: data.user, 
            isAuthenticated: true, 
            loading: false 
          });
          return { token: data.token, user: data.user };
        } catch (err) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Error signing out of Supabase:', err);
        }
        set({ token: null, user: null, isAuthenticated: false, error: null, loading: false });
      },

      clearError: () => set({ error: null }),

      updateUser: (updatedUser) => set((state) => ({ user: { ...state.user, ...updatedUser } })),

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
