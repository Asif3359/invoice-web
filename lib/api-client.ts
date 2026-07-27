import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("admin_token");
    if (token) {
      // ✅ Use `set` method to avoid type issues with AxiosHeaders
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});