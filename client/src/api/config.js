/**
 * Centralized API & Asset URL Configuration
 * Enforces production-safe API host resolution across all client modules and stores.
 */

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

export const API_URL = (
  rawApiUrl && 
  !rawApiUrl.includes('REPLACE_WITH') && 
  (!rawApiUrl.includes('localhost') || import.meta.env.DEV)
) 
  ? rawApiUrl 
  : (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

export const getImageBaseUrl = () => {
  if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
    return API_URL.replace(/\/api\/?$/, '');
  }
  // Relative origin in production
  return '';
};
