import axios from 'axios';

/**
 * Resolves the API Base URL safely across development and production environments.
 * 
 * Rules:
 * 1. If VITE_API_URL is explicitly set (e.g. deployed backend URL), use it without trailing slash.
 * 2. In production (e.g. Vercel deployment), NEVER fallback to localhost. Default to '' (relative paths).
 * 3. In local development (import.meta.env.DEV), fallback to 'http://localhost:5001' if not provided.
 */
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Only use localhost in local development
  if (import.meta.env.DEV) {
    return 'http://localhost:5001';
  }

  // In production (Vercel), default to relative API routes on same origin
  return '';
};

export const API_BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000, // 15s timeout for mobile networks
});

// Response interceptor with descriptive mobile and cross-network error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';

    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      message = 'Request timed out. Please check your mobile or Wi-Fi network and try again.';
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const target = API_BASE_URL ? `backend (${API_BASE_URL})` : 'backend server';
      message = `Network Error: Unable to reach the ${target}. Please verify internet access and server status.`;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.status === 404) {
      message = 'The requested resource was not found on the server (404).';
    } else if (error.response?.status >= 500) {
      message = 'Server encountered an internal error. Please try again in a few moments.';
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
