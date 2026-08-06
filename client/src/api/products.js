import { useQuery } from '@tanstack/react-query';
import { getCustomerToken } from './authHelper';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_URL = (rawApiUrl && !rawApiUrl.includes('REPLACE_WITH') && (!rawApiUrl.includes('localhost') || import.meta.env.DEV))
  ? rawApiUrl
  : (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

const buildQueryString = (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });
  return new URLSearchParams(cleanParams).toString();
};

// Fallback data is lazy-loaded (dynamic import) only when the API fails
// This avoids parsing ~450 lines of data on every page load
const loadFallbackData = async () => {
  const { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } = await import('./fallbackProducts.js');
  return { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES };
};

const applyFallbackFilters = (FALLBACK_PRODUCTS, params = {}) => {
  const { search = '', category = '', sort = 'newest', minPrice = '', maxPrice = '', page = 1, limit = 12 } = params;

  let filtered = [...FALLBACK_PRODUCTS];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    );
  }

  if (category) {
    filtered = filtered.filter(p =>
      p.category?.slug === category || p.category?.name.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice) filtered = filtered.filter(p => Number(p.base_price) >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(p => Number(p.base_price) <= Number(maxPrice));

  if (sort === 'newest')          filtered.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
  else if (sort === 'price_asc')  filtered.sort((a, b) => a.base_price - b.base_price);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.base_price - a.base_price);
  else if (sort === 'trending')   filtered.sort((a, b) => (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0));

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const start = (Math.max(1, Number(page)) - 1) * limit;
  const products = filtered.slice(start, start + Number(limit));

  return { success: true, products, totalCount, totalPages, page: Number(page) };
};



export const fetchProducts = async (params = {}) => {
  try {
    const query = buildQueryString(params);
    const response = await fetch(`${API_URL}/products?${query}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    if (data?.products?.length) return data;
    // API returned empty — fall through to fallback
    const { FALLBACK_PRODUCTS } = await loadFallbackData();
    return applyFallbackFilters(FALLBACK_PRODUCTS, params);
  } catch {
    const { FALLBACK_PRODUCTS } = await loadFallbackData();
    return applyFallbackFilters(FALLBACK_PRODUCTS, params);
  }
};


export const fetchProductBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/products/${slug}`);
    if (!response.ok) {
      const { FALLBACK_PRODUCTS } = await loadFallbackData();
      const found = FALLBACK_PRODUCTS.find(p => p.slug === slug) || FALLBACK_PRODUCTS[0];
      return { success: true, product: found };
    }
    return response.json();
  } catch {
    const { FALLBACK_PRODUCTS } = await loadFallbackData();
    const found = FALLBACK_PRODUCTS.find(p => p.slug === slug) || FALLBACK_PRODUCTS[0];
    return { success: true, product: found };
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
      const { FALLBACK_CATEGORIES } = await loadFallbackData();
      return { success: true, categories: FALLBACK_CATEGORIES };
    }
    const data = await response.json();
    if (data?.categories?.length) return data;
    const { FALLBACK_CATEGORIES } = await loadFallbackData();
    return { success: true, categories: FALLBACK_CATEGORIES };
  } catch {
    const { FALLBACK_CATEGORIES } = await loadFallbackData();
    return { success: true, categories: FALLBACK_CATEGORIES };
  }
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
