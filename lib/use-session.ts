"use client";

import { useSyncExternalStore } from "react";
import {
  SESSION_EVENT,
  getSessionSnapshot,
  invalidateSessionSnapshot,
  type StoredSession,
} from "./session";

function getServerSnapshot(): StoredSession | null {
  return null;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => {
    // Same-tab changes already invalidate the cache in the session helpers;
    // cross-tab storage events need to do it here.
    invalidateSessionSnapshot();
    callback();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(SESSION_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SESSION_EVENT, handleChange);
  };
}

const emptySubscribe = () => () => {};

export function useStoredSession() {
  return useSyncExternalStore(subscribe, getSessionSnapshot, getServerSnapshot);
}

/** False during SSR and the first hydration render, true afterwards. */
export function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
