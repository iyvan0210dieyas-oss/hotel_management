import { API_BASE_URL } from '../services/api';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

/**
 * Returns an absolute or clean relative URL for hotel images.
 * Never hardcodes localhost in production.
 *
 * @param {string|null|undefined} imagePath
 * @returns {string} Safe image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return FALLBACK_IMAGE;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  // If already an absolute URL (http, https) or inline data URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Format relative filename under /uploads
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const uploadPath = cleanPath.startsWith('/uploads') ? cleanPath : `/uploads${cleanPath}`;

  // If API_BASE_URL is configured (e.g. deployed backend), prefix it; otherwise use relative path
  return API_BASE_URL ? `${API_BASE_URL}${uploadPath}` : uploadPath;
};

export default getImageUrl;
