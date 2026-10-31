export type SessionKind = "business" | "admin";

export interface StoredSessionUser {
  fullName?: string;
  email?: string;
  role?: string;
}

export interface StoredSession {
  kind: SessionKind;
  user: StoredSessionUser | null;
}

const KEYS = {
  businessToken: "business_token",
  businessRefreshToken: "business_refresh_token",
  businessUser: "business_user",
  adminToken: "admin_token",
  adminRefreshToken: "admin_refresh_token",
  adminUser: "admin_user",
} as const;

/** Fired in the same tab whenever the stored session changes. */
export const SESSION_EVENT = "invoice-session-change";

/**
 * Stable snapshot used by useSyncExternalStore. It is invalidated whenever a
 * session helper runs, so a logout in one dashboard cannot leave a stale
 * session cached for the login page.
 */
let cachedSession: StoredSession | null | undefined;

function emitSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

function invalidateSessionCache() {
  cachedSession = undefined;
  emitSessionChange();
}

function readUser(key: string): StoredSessionUser | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredSessionUser) : null;
  } catch {
    return null;
  }
}

function computeStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  if (window.localStorage.getItem(KEYS.businessToken)) {
    return { kind: "business", user: readUser(KEYS.businessUser) };
  }

  if (window.localStorage.getItem(KEYS.adminToken)) {
    return { kind: "admin", user: readUser(KEYS.adminUser) };
  }

  return null;
}

/** Always reads localStorage. Use this in guards before making API calls. */
export function getStoredSession(): StoredSession | null {
  return computeStoredSession();
}

/** Cached snapshot for useSyncExternalStore. */
export function getSessionSnapshot(): StoredSession | null {
  if (cachedSession === undefined) {
    cachedSession = computeStoredSession();
  }
  return cachedSession;
}

/** Used by the cross-tab storage listener. */
export function invalidateSessionSnapshot() {
  cachedSession = undefined;
}

export function storeBusinessSession(
  tokens: { accessToken: string; refreshToken?: string },
  user?: StoredSessionUser,
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(KEYS.businessToken, tokens.accessToken);
  if (tokens.refreshToken) {
    window.localStorage.setItem(KEYS.businessRefreshToken, tokens.refreshToken);
  }
  if (user) {
    window.localStorage.setItem(KEYS.businessUser, JSON.stringify(user));
  }

  // Only one kind of session should be active at a time.
  window.localStorage.removeItem(KEYS.adminToken);
  window.localStorage.removeItem(KEYS.adminRefreshToken);
  window.localStorage.removeItem(KEYS.adminUser);

  invalidateSessionCache();
}

export function storeAdminSession(
  tokens: { accessToken: string; refreshToken?: string },
  user?: StoredSessionUser,
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(KEYS.adminToken, tokens.accessToken);
  if (tokens.refreshToken) {
    window.localStorage.setItem(KEYS.adminRefreshToken, tokens.refreshToken);
  }
  if (user) {
    window.localStorage.setItem(KEYS.adminUser, JSON.stringify(user));
  }

  window.localStorage.removeItem(KEYS.businessToken);
  window.localStorage.removeItem(KEYS.businessRefreshToken);
  window.localStorage.removeItem(KEYS.businessUser);

  invalidateSessionCache();
}

export function updateSessionUser(kind: SessionKind, user: StoredSessionUser) {
  if (typeof window === "undefined") return;

  const key = kind === "business" ? KEYS.businessUser : KEYS.adminUser;
  window.localStorage.setItem(key, JSON.stringify(user));
  invalidateSessionCache();
}

export function clearSession(kind?: SessionKind) {
  if (typeof window === "undefined") return;

  if (!kind || kind === "business") {
    window.localStorage.removeItem(KEYS.businessToken);
    window.localStorage.removeItem(KEYS.businessRefreshToken);
    window.localStorage.removeItem(KEYS.businessUser);
  }

  if (!kind || kind === "admin") {
    window.localStorage.removeItem(KEYS.adminToken);
    window.localStorage.removeItem(KEYS.adminRefreshToken);
    window.localStorage.removeItem(KEYS.adminUser);
  }

  invalidateSessionCache();
}

export function getInitials(value?: string | null): string {
  if (!value) return "U";

  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
