"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  FOREST_STORAGE_KEY,
  FOREST_THEMES,
  isForestSeason,
  type ForestSeason,
  type ForestThemeConfig,
} from "./themes";

const DEFAULT_THEME: ForestSeason = "wewin";

let currentTheme: ForestSeason = DEFAULT_THEME;
let hydrated = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getThemeSnapshot() {
  return currentTheme;
}

function getHydratedSnapshot() {
  return hydrated;
}

function getServerThemeSnapshot() {
  return DEFAULT_THEME;
}

function getServerHydratedSnapshot() {
  return false;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function writeStoredTheme(next: ForestSeason) {
  try {
    localStorage.setItem(FOREST_STORAGE_KEY, next);
  } catch {
    // ignore storage errors
  }
}

function applyTheme(next: ForestSeason, persist: boolean) {
  if (currentTheme === next && hydrated) return;
  currentTheme = next;
  if (persist) writeStoredTheme(next);
  emitChange();
}

/** Always start on WeWin when the site opens; user can still switch during the session. */
function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  currentTheme = DEFAULT_THEME;
  writeStoredTheme(DEFAULT_THEME);
  emitChange();
}

export function useForestTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );

  useEffect(() => {
    ensureHydrated();

    const onStorage = (event: StorageEvent) => {
      if (event.key === FOREST_STORAGE_KEY && isForestSeason(event.newValue)) {
        applyTheme(event.newValue, false);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: ForestSeason) => {
    ensureHydrated();
    applyTheme(next, true);
  }, []);

  const config: ForestThemeConfig = FOREST_THEMES[theme];

  return { theme, setTheme, config, hydrated: isHydrated };
}
