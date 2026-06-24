import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let onAuthExpired = () => {
  window.location.href = '/login';
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

    if (error.response?.status === 401 && !originalRequest._retry) {
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
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject({
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      status: error.response?.status || 500,
    });
  }
);

export default api;
