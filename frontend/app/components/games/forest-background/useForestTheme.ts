"use client";

import { useCallback, useEffect, useState } from "react";

import {
  FOREST_STORAGE_KEY,
  FOREST_THEMES,
  isForestSeason,
  type ForestSeason,
  type ForestThemeConfig,
} from "./themes";

const DEFAULT_THEME: ForestSeason = "spring";

export function useForestTheme() {
  const [theme, setThemeState] = useState<ForestSeason>(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FOREST_STORAGE_KEY);
      if (isForestSeason(saved)) {
        setThemeState(saved);
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  const setTheme = useCallback((next: ForestSeason) => {
    setThemeState(next);
    try {
      localStorage.setItem(FOREST_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  const config: ForestThemeConfig = FOREST_THEMES[theme];

  return { theme, setTheme, config, hydrated };
}
