import useCustomerAuthStore from '../store/customerAuthStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = useCustomerAuthStore.getState().getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Profile
export const getUserProfile = async () => {
  const res = await fetch(`${API}/user/profile`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data.user;
};

export const updateUserProfile = async (profileData) => {
  const res = await fetch(`${API}/user/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data.user;
};

// Addresses
export const getAddresses = async () => {
  const res = await fetch(`${API}/user/addresses`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch addresses');
  return data.addresses;
};

export const addAddress = async (addressData) => {
  const res = await fetch(`${API}/user/addresses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(addressData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add address');
  return data.address;
};

export const updateAddress = async (id, addressData) => {
  const res = await fetch(`${API}/user/addresses/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(addressData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update address');
  return data.address;
};

export const deleteAddress = async (id) => {
  const res = await fetch(`${API}/user/addresses/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete address');
  return data;
};

// Wishlist
export const getWishlist = async () => {
  const res = await fetch(`${API}/user/wishlist`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch wishlist');
  return data.wishlist;
};

export const addToWishlist = async (productId, variantId = null) => {
  const res = await fetch(`${API}/user/wishlist`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ product_id: productId, variant_id: variantId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add to wishlist');
  return data.wishlistItem;
};

export const removeFromWishlist = async (id) => {
  const res = await fetch(`${API}/user/wishlist/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove from wishlist');
  return data;
};
