import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useCartStore from '../store/cartStore';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

const getHeaders = () => {
  const token = localStorage.getItem('token');
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
