
import axios, { AxiosError } from 'axios';
import { parseApiError } from './errorHandler';

// Use environment variable or default to production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-blockchain-oracle.vercel.app';

const isDevelopment = import.meta.env.DEV;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
  withCredentials: false,
});

// Helper to handle API errors gracefully - returns safe empty data
export const handleApiError = (error: unknown, fallbackData: any = null): any => {
  const parsed = parseApiError(error);
  if (isDevelopment) {
    console.error('[API Error Handler]:', parsed);
  }
  return fallbackData;
};

// Helper that wraps API calls with error handling
export const withApiErrorHandler = async <T,>(
  apiCall: () => Promise<T>,
  fallbackValue: T
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    const parsed = parseApiError(error);
    if (isDevelopment) {
      console.error('[API Error]:', parsed.message);
    }
    return fallbackValue;
  }
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

interface ExtendedAxiosRequestConfig {
  _retry?: boolean;
  suppressErrorLogging?: boolean;
}

// Request interceptor for auth token and logging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }

    if (isDevelopment) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('[API] Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & ExtendedAxiosRequestConfig);

    if (isDevelopment && !originalRequest?.suppressErrorLogging) {
      const parsed = parseApiError(error);
      console.error(`[API] Error ${parsed.statusCode}: ${parsed.message}`, parsed);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem('access_token', access);

      processQueue(null, access);

      originalRequest.headers.Authorization = `Bearer ${access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
