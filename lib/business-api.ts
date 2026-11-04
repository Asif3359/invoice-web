import axios from "axios";
import { attachRefreshInterceptor } from "./auth-refresh";

/**
 * Base URL for business (main user) endpoints.
 *
 * The backend mounts business routes at the root (e.g. /auth/login,
 * /auth/profile) but mounts system-admin routes under /api/admin. The shared
 * NEXT_PUBLIC_API_BASE_URL therefore includes /api for the admin client.
 *
 * For business calls we strip a trailing /api so the same environment variable
 * works for both production and a local backend:
 *
 *   https://api.inventomanager.com/api -> https://api.inventomanager.com
 *   http://localhost:3000/api         -> http://localhost:3000
 *
 * NEXT_PUBLIC_BUSINESS_API_BASE_URL can override this if the backend is ever
 * deployed with a different layout.
 */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const businessBaseUrl =
  process.env.NEXT_PUBLIC_BUSINESS_API_BASE_URL ??
  apiBaseUrl.replace(/\/api\/?$/, "");

export const businessApi = axios.create({
  baseURL: businessBaseUrl,
  withCredentials: true,
});

businessApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("business_token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

attachRefreshInterceptor(businessApi, {
  kind: "business",
  refreshPath: "/auth/refresh-token",
});
