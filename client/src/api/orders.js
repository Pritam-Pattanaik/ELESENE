import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomerToken } from './authHelper';
import useCartStore from '../store/cartStore';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_URL = (rawApiUrl && !rawApiUrl.includes('REPLACE_WITH') && (!rawApiUrl.includes('localhost') || import.meta.env.DEV))
  ? rawApiUrl
  : (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

const getHeaders = () => {
  const token = getCustomerToken();
  const sessionId = useCartStore.getState().sessionId;
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (sessionId) headers['x-session-id'] = sessionId;
  
  return headers;
};

// CART APIs
export const fetchCart = async () => {
  const response = await fetch(`${API_URL}/cart`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch cart');
  return response.json();
};

export const addToCart = async (data) => {
  const response = await fetch(`${API_URL}/cart/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add to cart');
  return response.json();
};

// ORDER APIs
export const initiateOrder = async (data) => {
  const response = await fetch(`${API_URL}/orders/initiate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to initiate order');
  return response.json();
};

export const verifyPayment = async (data) => {
  const response = await fetch(`${API_URL}/orders/verify-payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Payment verification failed');
  return response.json();
};

export const getUserOrders = async () => {
  const response = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
  return data.orders || [];
};

export const applyCoupon = async (data) => {
  const response = await fetch(`${API_URL}/orders/apply-coupon`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Failed to apply coupon');
  }
  return resData;
};

// Hooks
export const useCart = () => {
  const { setItems } = useCartStore();
  
  return useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    onSuccess: (data) => {
      if (data.success && data.cart) {
        setItems(data.cart.CartItems || []);
      }
    }
  });
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
