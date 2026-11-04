import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import {
  clearSession,
  getRefreshToken,
  storeAccessToken,
  type SessionKind,
} from "./session";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Access tokens are short-lived (15 minutes) while the refresh token lasts a
 * week. Without this, a session dies in the middle of someone's work: every
 * call answers 401 and the guards sign the user out.
 *
 * On the first 401 the stored refresh token is exchanged for a new access
 * token and the original request is replayed. Concurrent requests share one
 * refresh, and only a refresh that genuinely fails ends the session.
 */
export function attachRefreshInterceptor(
  instance: AxiosInstance,
  options: { kind: SessionKind; refreshPath: string },
) {
  const { kind, refreshPath } = options;
  const baseURL = instance.defaults.baseURL ?? "";

  let pending: Promise<string | null> | null = null;

  async function requestNewToken(): Promise<string | null> {
    const refreshToken = getRefreshToken(kind);
    if (!refreshToken) return null;

    try {
      const { data } = await axios.post<{
        data?: { accessToken?: string };
      }>(
        `${baseURL}${refreshPath}`,
        { refreshToken },
        { withCredentials: true },
      );

      const accessToken = data?.data?.accessToken;
      if (!accessToken) return null;

      storeAccessToken(kind, accessToken);
      return accessToken;
    } catch {
      return null;
    }
  }

  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (!config || config._retry) return Promise.reject(error);
    if (error.response?.status !== 401) return Promise.reject(error);
    if (config.url?.includes(refreshPath)) return Promise.reject(error);

    config._retry = true;

    pending ??= requestNewToken().finally(() => {
      pending = null;
    });

    const accessToken = await pending;

    if (!accessToken) {
      // The session really is over. Guards react to this change and sign out.
      clearSession(kind);
      return Promise.reject(error);
    }

    // The request interceptor reads the renewed token from storage.
    return instance(config);
  });
}
