"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useForestTheme } from "./useForestTheme";
import type { ForestSeason, ForestThemeConfig } from "./themes";

type ForestThemeContextValue = {
  theme: ForestSeason;
  setTheme: (season: ForestSeason) => void;
  config: ForestThemeConfig;
  hydrated: boolean;
};

const ForestThemeContext = createContext<ForestThemeContextValue | null>(null);

export function ForestThemeProvider({
  value,
  children,
}: {
  value: ForestThemeContextValue;
  children: ReactNode;
}) {
  return (
    <ForestThemeContext.Provider value={value}>
      {children}
    </ForestThemeContext.Provider>
  );
}

/** Standalone provider when not using ForestPageShell */
export function ForestThemeProviderStandalone({ children }: { children: ReactNode }) {
  const value = useForestTheme();
  return <ForestThemeProvider value={value}>{children}</ForestThemeProvider>;
}

export function useForestThemeContext() {
  const ctx = useContext(ForestThemeContext);
  if (!ctx) {
    throw new Error("useForestThemeContext must be used within ForestThemeProvider");
  }
  return ctx;
}

export function useForestThemeContextOptional() {
  return useContext(ForestThemeContext);
}
