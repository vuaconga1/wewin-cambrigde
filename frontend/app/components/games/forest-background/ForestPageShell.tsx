"use client";

import { useEffect, useState, type ReactNode } from "react";

import { FantasyForestBackground } from "./FantasyForestBackground";
import { ForestThemeProvider } from "./ForestThemeContext";
import { SeasonThemeSwitcher } from "./SeasonThemeSwitcher";
import { useForestTheme } from "./useForestTheme";

type ForestPageShellProps = {
  children: ReactNode;
  /** Chỉ bật ở màn chọn topic / loại game */
  showThemeSwitcher?: boolean;
};

export function ForestPageShell({
  children,
  showThemeSwitcher = false,
}: ForestPageShellProps) {
  const forestTheme = useForestTheme();
  const { theme, setTheme, config } = forestTheme;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <ForestThemeProvider value={forestTheme}>
      <div className="relative min-h-screen">
        <FantasyForestBackground config={config} reducedMotion={reducedMotion} />
        <div className="relative z-10">{children}</div>
        {showThemeSwitcher && (
          <SeasonThemeSwitcher theme={theme} onChange={setTheme} />
        )}
      </div>
    </ForestThemeProvider>
  );
}
