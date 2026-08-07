import { getCustomerToken } from './authHelper';
import { API_URL as API } from './config';

const getHeaders = () => {
  const token = getCustomerToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (res, defaultMsg) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || defaultMsg);
    err.status = res.status;
    throw err;
  }
  return data;
};

// Profile
export const getUserProfile = async () => {
  if (!getCustomerToken()) return null;
  try {
    const res = await fetch(`${API}/user/profile`, { headers: getHeaders() });
    const data = await handleResponse(res, 'Failed to fetch profile');
    return data.user;
  } catch {
    return null;
  }
};

export const updateUserProfile = async (profileData) => {
  const res = await fetch(`${API}/user/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData)
  });
  const data = await handleResponse(res, 'Failed to update profile');
  return data.user;
};

// Addresses
export const getAddresses = async () => {
  if (!getCustomerToken()) return [];
  try {
    const res = await fetch(`${API}/user/addresses`, { headers: getHeaders() });
    const data = await handleResponse(res, 'Failed to fetch addresses');
    return data.addresses || [];
  } catch {
    return [];
  }
};

export const addAddress = async (addressData) => {
  const res = await fetch(`${API}/user/addresses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(addressData)
  });
  const data = await handleResponse(res, 'Failed to add address');
  return data.address;
};

export const updateAddress = async (id, addressData) => {
  const res = await fetch(`${API}/user/addresses/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(addressData)
  });
  const data = await handleResponse(res, 'Failed to update address');
  return data.address;
};

export const deleteAddress = async (id) => {
  const res = await fetch(`${API}/user/addresses/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res, 'Failed to delete address');
};

// Wishlist
export const getWishlist = async () => {
  if (!getCustomerToken()) return [];
  try {
    const res = await fetch(`${API}/user/wishlist`, { headers: getHeaders() });
    const data = await handleResponse(res, 'Failed to fetch wishlist');
    return data.wishlist || [];
  } catch {
    return [];
  }
};

export const addToWishlist = async (productId, variantId = null) => {
  const res = await fetch(`${API}/user/wishlist`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ product_id: productId, variant_id: variantId })
  });
  const data = await handleResponse(res, 'Failed to add to wishlist');
  return data.wishlistItem;
};

export const removeFromWishlist = async (id) => {
  const res = await fetch(`${API}/user/wishlist/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res, 'Failed to remove from wishlist');
};

export const removeFromWishlistByProduct = async (productId) => {
  const res = await fetch(`${API}/user/wishlist/product/${productId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res, 'Failed to remove from wishlist');
};

// Notifications
export const getNotifications = async ({ page = 1, limit = 20, unread_only = false } = {}) => {
  if (!getCustomerToken()) return { notifications: [], unreadCount: 0 };
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (unread_only) params.set('unread_only', 'true');
    const res = await fetch(`${API}/user/notifications?${params}`, { headers: getHeaders() });
    const data = await handleResponse(res, 'Failed to fetch notifications');
    return data;
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
};

export const markNotificationRead = async (id) => {
  const res = await fetch(`${API}/user/notifications/${id}/read`, {
    method: 'PUT',
    headers: getHeaders()
  });
  return handleResponse(res, 'Failed to mark notification as read');
};

export const markAllNotificationsRead = async () => {
  const res = await fetch(`${API}/user/notifications/read-all`, {
    method: 'PUT',
    headers: getHeaders()
  });
  return handleResponse(res, 'Failed to mark all notifications as read');
};

export const deleteNotification = async (id) => {
  const res = await fetch(`${API}/user/notifications/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res, 'Failed to delete notification');
};

export const changePassword = async (currentPassword, newPassword) => {
  const res = await fetch(`${API}/auth/change-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await handleResponse(res, 'Failed to change password');
  return data;
};
