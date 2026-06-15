import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const adminFetch = async (url, options = {}) => {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const adminLogin = (credentials) =>
  adminFetch('/auth/admin-login', { method: 'POST', body: JSON.stringify(credentials) });

// Dashboard
export const fetchDashboard = () => adminFetch('/admin/dashboard');
export const useDashboard = () =>
  useQuery({ queryKey: ['admin-dashboard'], queryFn: fetchDashboard, staleTime: 30000 });

// Products
export const fetchAdminProducts = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return adminFetch(`/admin/products?${q}`);
};
export const fetchAdminProduct = (id) => adminFetch(`/admin/products/${id}`);
export const createProduct = (data) =>
  adminFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = ({ id, ...data }) =>
  adminFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id) =>
  adminFetch(`/admin/products/${id}`, { method: 'DELETE' });
export const uploadProductImages = async (id, files) => {
  const token = useAuthStore.getState().token;
  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));
  const res = await fetch(`${API_URL}/admin/products/${id}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
export const deleteProductImage = ({ productId, imageId }) =>
  adminFetch(`/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' });

// Variants
export const createVariant = ({ productId, ...data }) =>
  adminFetch(`/admin/products/${productId}/variants`, { method: 'POST', body: JSON.stringify(data) });
export const updateVariant = ({ productId, variantId, ...data }) =>
  adminFetch(`/admin/products/${productId}/variants/${variantId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteVariant = ({ productId, variantId }) =>
  adminFetch(`/admin/products/${productId}/variants/${variantId}`, { method: 'DELETE' });

// Categories
export const fetchAdminCategories = () => adminFetch('/admin/categories');
export const createCategory = (data) =>
  adminFetch('/admin/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = ({ id, ...data }) =>
  adminFetch(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id) =>
  adminFetch(`/admin/categories/${id}`, { method: 'DELETE' });

// Orders
export const fetchAdminOrders = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return adminFetch(`/admin/orders?${q}`);
};
export const fetchAdminOrder = (id) => adminFetch(`/admin/orders/${id}`);
export const updateOrderStatus = ({ id, status }) =>
  adminFetch(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const updateOrderTracking = ({ id, tracking_number }) =>
  adminFetch(`/admin/orders/${id}/tracking`, { method: 'PUT', body: JSON.stringify({ tracking_number }) });

// Users
export const fetchAdminUsers = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return adminFetch(`/admin/users?${q}`);
};
export const fetchAdminUser = (id) => adminFetch(`/admin/users/${id}`);
export const updateUserRole = ({ id, role }) =>
  adminFetch(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });

// Coupons
export const fetchAdminCoupons = () => adminFetch('/admin/coupons');
export const createCoupon = (data) =>
  adminFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(data) });
export const updateCoupon = ({ id, ...data }) =>
  adminFetch(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCoupon = (id) =>
  adminFetch(`/admin/coupons/${id}`, { method: 'DELETE' });

// React Query Hooks
export const useAdminProducts = (params) =>
  useQuery({ queryKey: ['admin-products', params], queryFn: () => fetchAdminProducts(params), staleTime: 15000 });

export const useAdminProduct = (id) =>
  useQuery({ queryKey: ['admin-product', id], queryFn: () => fetchAdminProduct(id), enabled: !!id });

export const useAdminCategories = () =>
  useQuery({ queryKey: ['admin-categories'], queryFn: fetchAdminCategories, staleTime: 60000 });

export const useAdminOrders = (params) =>
  useQuery({ queryKey: ['admin-orders', params], queryFn: () => fetchAdminOrders(params), staleTime: 15000 });

export const useAdminOrder = (id) =>
  useQuery({ queryKey: ['admin-order', id], queryFn: () => fetchAdminOrder(id), enabled: !!id });

export const useAdminUsers = (params) =>
  useQuery({ queryKey: ['admin-users', params], queryFn: () => fetchAdminUsers(params), staleTime: 30000 });

export const useAdminCoupons = () =>
  useQuery({ queryKey: ['admin-coupons'], queryFn: fetchAdminCoupons, staleTime: 60000 });

// Mutation hooks
export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createProduct, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }) });
};
export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateProduct, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }) });
};
export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteProduct, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }) });
};
export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateOrderStatus, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }) });
};
export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCategory, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });
};
export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateCategory, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });
};
export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCoupon, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }) });
};
export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateCoupon, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }) });
};
export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateUserRole, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });
};
