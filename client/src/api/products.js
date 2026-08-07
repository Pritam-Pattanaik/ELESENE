import { useQuery } from '@tanstack/react-query';
import { getCustomerToken } from './authHelper';
import { API_URL } from './config';

const buildQueryString = (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });
  return new URLSearchParams(cleanParams).toString();
};

export const fetchProducts = async (params = {}) => {
  const query = buildQueryString(params);
  const response = await fetch(`${API_URL}/products?${query}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
};

export const fetchProductBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/products/${slug}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch product');
  return data;
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
  return data;
};

export const submitProductReview = async (productId, reviewData) => {
  const token = getCustomerToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify(reviewData)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit review');
  }
  return data.review;
};

// React Query Hooks
export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 60000,
  });
};

export const useProduct = (slug) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60000,
  });
};
