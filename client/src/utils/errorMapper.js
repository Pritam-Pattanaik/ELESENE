/**
 * Utility to transform technical or status-code API errors into luxury-branded, human-readable messages.
 */
export const toHumanReadableError = (error, context = 'general') => {
  if (!error) {
    return {
      title: 'Unexpected Interruption',
      message: 'An unpredicted issue occurred. Please retry your request.',
      actionLabel: 'Retry'
    };
  }

  const rawMessage = typeof error === 'string' ? error : error.message || error.error || '';
  const status = error.status || error.statusCode || error.response?.status;

  // 1. Network / Connectivity Failures
  if (
    rawMessage.includes('Failed to fetch') || 
    rawMessage.includes('NetworkError') || 
    (error.name === 'TypeError' && rawMessage.toLowerCase().includes('fetch'))
  ) {
    return {
      title: 'Temporary Interruption',
      message: 'Unable to reach ELESENE servers at the moment. Please check your connection and retry.',
      actionLabel: 'Retry'
    };
  }

  // 2. Authentication & Session Errors
  const lowerMsg = rawMessage.toLowerCase();
  const isExplicitlyExpired = lowerMsg.includes('token expired') ||
    lowerMsg.includes('session expired') ||
    lowerMsg.includes('jwt session has been revoked') ||
    lowerMsg.includes('invalid supabase token') ||
    lowerMsg.includes('supabase token expired');
  
  if (
    status === 401 || 
    status === 403 || 
    isExplicitlyExpired ||
    lowerMsg.includes('invalid signature') ||
    lowerMsg.includes('not authorized, no token')
  ) {
    if (isExplicitlyExpired || lowerMsg.includes('session expired')) {
      return {
        title: 'Session Expired',
        message: 'Your atelier session has expired. Please sign in again to access your account details.',
        actionLabel: 'Sign In Again',
        redirectTo: '/auth'
      };
    }
    return {
      title: 'Authentication Required',
      message: 'Please sign in again to continue.',
      actionLabel: 'Sign In',
      redirectTo: '/auth'
    };
  }

  // 3. Resource Not Found (404)
  if (status === 404 || rawMessage.toLowerCase().includes('not found')) {
    return {
      title: 'Creation Unavailable',
      message: 'The requested piece or atelier page could not be located.',
      actionLabel: 'Return to Shop',
      redirectTo: '/shop'
    };
  }

  // 4. Server Errors (500+)
  if (status >= 500 || rawMessage.includes('500') || rawMessage.toLowerCase().includes('server error')) {
    return {
      title: 'Atelier Maintenance',
      message: 'Our digital ateliers are currently undergoing brief service enhancements. Please retry shortly.',
      actionLabel: 'Retry Request'
    };
  }

  // 5. Context-Specific Custom Fallbacks
  const contextMessages = {
    cart: 'Unable to update your shopping tote. Please try again.',
    checkout: 'Payment gateway or order processing could not be completed. Please review address details and retry.',
    wishlist: 'Unable to update your saved wishlist items. Please retry.',
    orders: 'Unable to retrieve your order history. Please try again.',
    addresses: 'Unable to load your saved addresses. Please retry.',
    profile: 'Unable to load profile preferences. Please refresh.'
  };

  return {
    title: 'Service Interruption',
    message: rawMessage || contextMessages[context] || 'An unexpected issue occurred while processing your request.',
    actionLabel: 'Try Again'
  };
};
