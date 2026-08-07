import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabase';
import { API_URL as API_BASE } from '../api/config';

// Avoid circular import — access via dynamic import at call time
const getWishlistStore = () => import('./wishlistStore').then(m => m.default);

const hasRealSupabase = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('placeholder') && !url.includes('your-') && !key.includes('placeholder');
};

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

        // 1. Try Supabase Auth if real keys exist
        if (hasRealSupabase()) {
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
              getWishlistStore().then(store => store.getState().fetchWishlist()).catch(() => {});
              return { token: data.session.access_token, user: mappedUser };
            }
            // If Supabase returned an auth error (e.g. wrong credentials), surface it directly.
            // Do NOT fall through to the API — it won't help and may show a confusing error.
            if (error) {
              // Map Supabase error messages to user-friendly ones
              const supaMsg = error.message || '';
              const isNetworkError = supaMsg.toLowerCase().includes('load failed')
                || supaMsg.toLowerCase().includes('failed to fetch')
                || supaMsg.toLowerCase().includes('network')
                || supaMsg.toLowerCase().includes('fetch');
              const message = isNetworkError
                ? 'Unable to connect. Please check your internet connection and try again.'
                : (supaMsg || 'Invalid email or password');
              set({ loading: false, error: message });
              throw new Error(message);
            }
          } catch (supaErr) {
            // Re-throw if it's our own error (from above)
            if (supaErr?.message && !supaErr.message.includes('supabase') && !supaErr.message.includes('Supabase')) {
              const alreadyHandled = supaErr.message.includes('connect') || supaErr.message.includes('email') || supaErr.message.includes('password') || supaErr.message.includes('Invalid');
              if (alreadyHandled) throw supaErr;
            }
            // Otherwise it's an unexpected Supabase SDK error — fall through to API
          }
        }

        // 2. Express Backend API Fallback
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Invalid email or password');
          }

          set({ 
            token: data.token, 
            user: data.user, 
            isAuthenticated: true, 
            loading: false 
          });
          getWishlistStore().then(store => store.getState().fetchWishlist()).catch(() => {});
          return { token: data.token, user: data.user };
        } catch (err) {
          // Cover both Chrome ('Failed to fetch') and iOS Safari ('Load failed') network errors
          const isNetworkErr = err instanceof TypeError
            || err.name === 'TypeError'
            || (typeof err.message === 'string' && (
                err.message.toLowerCase().includes('load failed')
                || err.message.toLowerCase().includes('failed to fetch')
                || err.message.toLowerCase().includes('network')
              ));
          const message = isNetworkErr
            ? 'Unable to connect. Please check your internet connection and try again.'
            : (err.message || 'Invalid email or password');
          set({ loading: false, error: message });
          throw new Error(message, { cause: err });
        }
      },

      register: async (full_name, email, password) => {
        set({ loading: true, error: null });

        // 1. Try Supabase Auth if real keys exist
        if (hasRealSupabase()) {
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
              getWishlistStore().then(store => store.getState().fetchWishlist()).catch(() => {});
              return { token: data.session.access_token, user: mappedUser };
            }
            if (error) {
              const supaMsg = error.message || '';
              const isNetworkError = supaMsg.toLowerCase().includes('load failed')
                || supaMsg.toLowerCase().includes('failed to fetch')
                || supaMsg.toLowerCase().includes('network')
                || supaMsg.toLowerCase().includes('fetch');
              const message = isNetworkError
                ? 'Unable to connect. Please check your internet connection and try again.'
                : (supaMsg || 'Registration failed');
              set({ loading: false, error: message });
              throw new Error(message);
            }
          } catch (supaErr) {
            const alreadyHandled = supaErr?.message && (
              supaErr.message.includes('connect') || supaErr.message.includes('Registration') || supaErr.message.includes('email')
            );
            if (alreadyHandled) throw supaErr;
            // Otherwise fall through to API
          }
        }

        // 2. Express Backend API Fallback
        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password })
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Registration failed');
          }

          set({ 
            token: data.token, 
            user: data.user, 
            isAuthenticated: true, 
            loading: false 
          });
          getWishlistStore().then(store => store.getState().fetchWishlist()).catch(() => {});
          return { token: data.token, user: data.user };
        } catch (err) {
          // Cover both Chrome ('Failed to fetch') and iOS Safari ('Load failed') network errors
          const isNetworkErr = err instanceof TypeError
            || err.name === 'TypeError'
            || (typeof err.message === 'string' && (
                err.message.toLowerCase().includes('load failed')
                || err.message.toLowerCase().includes('failed to fetch')
                || err.message.toLowerCase().includes('network')
              ));
          const message = isNetworkErr
            ? 'Unable to connect. Please check your internet connection and try again.'
            : (err.message || 'Registration failed');
          set({ loading: false, error: message });
          throw new Error(message, { cause: err });
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
        // Clear wishlist on logout
        getWishlistStore().then(store => store.getState ? store.setState?.({ wishlistIds: [], items: [] }) : null).catch(() => {});
      },

      clearError: () => set({ error: null }),

      updateUser: (updatedUser) => set((state) => ({ user: { ...state.user, ...updatedUser } })),

      clearSession: () => {
        set({ token: null, user: null, isAuthenticated: false, error: null, loading: false });
        getWishlistStore().then(store => store.getState ? store.setState?.({ wishlistIds: [], items: [] }) : null).catch(() => {});
      },

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

// Automatically sync Supabase session tokens when auto-refreshed or changed
try {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      const currentState = useCustomerAuthStore.getState();
      if (currentState.token !== session.access_token) {
        useCustomerAuthStore.setState({
          token: session.access_token,
          isAuthenticated: true,
          ...(session.user && {
            user: {
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || currentState.user?.full_name || 'Customer',
              phone: session.user.phone || currentState.user?.phone || '',
              role: 'customer'
            }
          })
        });
      }
    } else if (event === 'SIGNED_OUT') {
      const currentState = useCustomerAuthStore.getState();
      if (currentState.token) {
        useCustomerAuthStore.setState({ token: null, user: null, isAuthenticated: false });
      }
    }
  });
} catch {
  // Ignore subscription error
}

export default useCustomerAuthStore;
