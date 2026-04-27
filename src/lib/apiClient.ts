import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/tokenStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request Interceptor — attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor — handle 401 + token refresh ────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refresh = getRefreshToken();

      if (!refresh) {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ access: string }>(
          `${BASE_URL}/api/users/token/refresh/`,
          { refresh }
        );
        const { access } = data;
        setTokens(access, refresh);
        processQueue(null, access);
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      console.error(`API Error [${error.response.status}] on ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}:`, error.response.data || error.message);
    } else if (error.request) {
      console.error('Network Error: No response received', error.request);
    } else {
      console.error('Error setting up the request', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
