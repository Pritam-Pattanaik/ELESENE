import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomerToken } from './authHelper';
import useCartStore from '../store/cartStore';
import { API_URL } from './config';

const getHeaders = () => {
  const token = getCustomerToken();
  const cartStore = useCartStore.getState();
  const sessionId = typeof cartStore.getSessionId === 'function' ? cartStore.getSessionId() : cartStore.sessionId;
  const headers = { 'Content-Type': 'application/json' };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (sessionId) headers['x-session-id'] = sessionId;

  return headers;
};

// API Methods
export const fetchCart = async () => {
  try {
    const response = await fetch(`${API_URL}/cart`, { headers: getHeaders() });
    if (!response.ok) {
      return { success: true, cart: { CartItems: [] } };
    }
    return response.json();
  } catch {
    return { success: true, cart: { CartItems: [] } };
  }
};

export const addToCart = async (data) => {
  const response = await fetch(`${API_URL}/cart/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add to cart');
  }
  return response.json();
};

export const updateCartItem = async (id, data) => {
  const body = typeof data === 'object' && data !== null ? data : { quantity: data };
  const response = await fetch(`${API_URL}/cart/items/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update cart item');
  }
  return response.json();
};

export const removeFromCart = async (id) => {
  const response = await fetch(`${API_URL}/cart/items/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to remove from cart');
  }
  return response.json();
};

// React Query Hooks
export const useCart = () => {
  const { syncFromServer } = useCartStore();

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  useEffect(() => {
    if (query.data?.success && query.data.cart) {
      syncFromServer(query.data.cart.CartItems || []);
    }
  }, [query.data, syncFromServer]);

  return query;
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCartItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => removeFromCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};
