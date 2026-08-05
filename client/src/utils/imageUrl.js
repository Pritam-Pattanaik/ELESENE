/**
 * Helper to generate environment-aware asset URLs.
 * Resolves relative image paths against VITE_API_URL base or relative origin.
 */
const FALLBACK_LUXURY_IMAGE = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80';

export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || !imagePath.trim()) {
    return FALLBACK_LUXURY_IMAGE;
  }
  const cleanPathStr = imagePath.trim();
  if (cleanPathStr.startsWith('http://') || cleanPathStr.startsWith('https://') || cleanPathStr.startsWith('data:')) {
    return cleanPathStr;
  }
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  const cleanPath = cleanPathStr.startsWith('/') ? cleanPathStr : `/${cleanPathStr}`;
  return `${baseUrl}${cleanPath}`;
};
