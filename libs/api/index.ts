import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.buildtrackerapp.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Centralized Cache-Buster Removal: 
  // Automatically strip manual `_t` parameters to enable proper React Query/Browser caching
  if (config.params && '_t' in config.params) {
    const { _t, ...rest } = config.params;
    config.params = rest;
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Allow browser to automatically set boundary for multipart form data
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }

  return config;
});

// Refresh Token Queue Logic
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "https://api.buildtrackerapp.com/api"}/auth/refresh-token/`,
            { refresh_token: refresh }
          );

          const newToken = res.data.token;
          const newRefreshToken = res.data.refresh_token;

          localStorage.setItem("access_token", newToken);
          localStorage.setItem("refresh_token", newRefreshToken);

          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
