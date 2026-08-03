import useCustomerAuthStore from '../store/customerAuthStore';

let isRedirecting = false;

export const handleAuthError = async () => {
  if (isRedirecting) return;
  isRedirecting = true;
  
  try {
    const { logout } = useCustomerAuthStore.getState();
    await logout();
  } catch (err) {
    console.error('Logout error:', err);
  }
  
  isRedirecting = false;
};

export const withAuthRetry = async (fetchFn, retryCount = 0) => {
  const MAX_RETRIES = 1;
  const res = await fetchFn();
  if (res.status === 401 && retryCount < MAX_RETRIES) {
    await handleAuthError();
    window.location.href = '/auth';
    return res;
  }
  return res;
};
