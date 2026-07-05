import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let onAuthExpired = () => {
  window.location.replace('/login');
};

export const setOnAuthExpired = (handler) => {
  onAuthExpired = handler;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const skipAuthRefresh = [
      '/auth/login',
      '/auth/register',
      '/auth/register/invite',
      '/auth/google',
      '/auth/google/callback',
      '/auth/logout',
      '/auth/refresh',
      '/auth/login-failed',
      '/auth/invite',
    ].some((path) => requestUrl.includes(path));

    if (error.response?.status === 401 && !originalRequest._retry && !skipAuthRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        onAuthExpired();
        return Promise.reject({
          message:
            refreshError.response?.data?.message || 'Session expired',
          code: refreshError.response?.data?.code || 'SESSION_EXPIRED',
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    const getErrorMessage = (err) => {
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'string') return data;
        if (typeof data === 'object' && data?.message) return data.message;
      }
      return err.message || 'An unexpected error occurred';
    };

    return Promise.reject({
      message: getErrorMessage(error),
      code: error.response?.data?.code || 'REQUEST_ERROR',
      status: error.response?.status || 500,
      issues: error.response?.data?.issues || [],
    });
  }
);

export default api;
