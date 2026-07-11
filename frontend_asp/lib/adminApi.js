'use client';
import axios from 'axios';

const LOCAL_API_URL = 'http://localhost:5000/api';
const PRODUCTION_API_URL = 'https://asp-cranes-9-july-26.vercel.app/api';
const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? PRODUCTION_API_URL
  : LOCAL_API_URL;

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_API_URL =
  process.env.NODE_ENV === 'production' && envApiUrl === LOCAL_API_URL
    ? PRODUCTION_API_URL
    : envApiUrl || DEFAULT_API_URL;

const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach Bearer Token
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('asp-auth');
      if (stored) {
        try {
          const { accessToken } = JSON.parse(stored);
          if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        } catch (e) {}
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return adminApi(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const stored = localStorage.getItem('asp-auth');
        const { refreshToken } = stored ? JSON.parse(stored) : {};
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${ADMIN_API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        const current = JSON.parse(localStorage.getItem('asp-auth') || '{}');
        localStorage.setItem('asp-auth', JSON.stringify({ ...current, accessToken, refreshToken: newRefreshToken }));

        adminApi.defaults.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return adminApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('asp-auth');
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle account revoked — immediate redirect
    if (error.response?.data?.code === 'ACCOUNT_REVOKED') {
      localStorage.removeItem('asp-auth');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login?reason=revoked';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default adminApi;
