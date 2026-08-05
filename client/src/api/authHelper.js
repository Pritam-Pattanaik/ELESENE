import useCustomerAuthStore from '../store/customerAuthStore';
import useAuthStore from '../store/authStore';

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp) {
      const nowSec = Math.floor(Date.now() / 1000);
      return payload.exp <= nowSec;
    }
  } catch {
    // Fall back to trusting token if payload unparseable
  }
  return false;
};

/**
 * Extract customer auth token from Zustand store, falling back to parsing
 * localStorage 'elesene-customer-auth' if store state is not hydrated yet.
 */
export const getCustomerToken = () => {
  let token = null;

  try {
    const storeState = useCustomerAuthStore.getState();
    token = storeState?.token || (typeof storeState?.getToken === 'function' ? storeState.getToken() : null);
  } catch {
    // Ignore store access error
  }

  if (!token) {
    try {
      const rawStorage = localStorage.getItem('elesene-customer-auth');
      if (rawStorage) {
        const parsed = JSON.parse(rawStorage);
        if (parsed?.state?.token) {
          token = parsed.state.token;
        }
      }
    } catch {
      // Ignore parse error
    }
  }

  if (token && isTokenExpired(token)) {
    try {
      useCustomerAuthStore.getState().clearSession?.();
    } catch {
      // Ignore cleanup error
    }
    return null;
  }

  return token;
};

/**
 * Extract admin auth token from Zustand store, falling back to parsing
 * localStorage 'elesene-admin-auth' if store state is not hydrated yet.
 */
export const getAdminToken = () => {
  try {
    const storeState = useAuthStore.getState();
    const tokenFromStore = storeState?.token || (typeof storeState?.getToken === 'function' ? storeState.getToken() : null);
    if (tokenFromStore) {
      return tokenFromStore;
    }
  } catch {
    // Ignore store access error
  }

  try {
    const rawStorage = localStorage.getItem('elesene-admin-auth');
    if (rawStorage) {
      const parsed = JSON.parse(rawStorage);
      if (parsed?.state?.token) {
        return parsed.state.token;
      }
    }
  } catch {
    // Ignore parse error
  }

  return null;
};
