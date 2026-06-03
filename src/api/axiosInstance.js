import axios from "axios";

const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = apiHost.endsWith("/api")
  ? apiHost
  : `${apiHost.replace(/\/$/, "")}/api`;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isAuthPage =
        path.startsWith("/login") ||
        path.startsWith("/register") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/reset-password");

      if (!isAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
