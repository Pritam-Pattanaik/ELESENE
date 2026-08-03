import useCustomerAuthStore from '../store/customerAuthStore';
import useAuthStore from '../store/authStore';

/**
 * Extract customer auth token from Zustand store, falling back to parsing
 * localStorage 'elesene-customer-auth' if store state is not hydrated yet.
 */
export const getCustomerToken = () => {
  try {
    const storeState = useCustomerAuthStore.getState();
    const tokenFromStore = storeState?.token || (typeof storeState?.getToken === 'function' ? storeState.getToken() : null);
    if (tokenFromStore) {
      return tokenFromStore;
    }
  } catch {
    // Ignore store access error
  }

  try {
    const rawStorage = localStorage.getItem('elesene-customer-auth');
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
