import axios from "axios";

const DEFAULT_API_URL = "http://localhost:8080";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry && !original?.url?.includes("/api/auth")) {
      original._retry = true;
      await api.post("/api/auth/refresh", {});
      return api(original);
    }
    return Promise.reject(error);
  }
);

