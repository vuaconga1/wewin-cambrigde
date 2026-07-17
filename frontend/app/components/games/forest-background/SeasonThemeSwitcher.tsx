"use client";

import { FOREST_SEASONS, FOREST_THEMES, type ForestSeason } from "./themes";

type SeasonThemeSwitcherProps = {
  theme: ForestSeason;
  onChange: (season: ForestSeason) => void;
};

export function SeasonThemeSwitcher({
  theme,
  onChange,
}: SeasonThemeSwitcherProps) {
  return (
    <div
      className="fixed z-30 bottom-24 right-3 md:bottom-auto md:top-4 md:right-4"
      role="radiogroup"
      aria-label="Chọn theme mùa"
    >
      <div className="flex items-center gap-1 rounded-full border border-white/50 bg-white/70 p-1.5 shadow-md backdrop-blur-md">
        {FOREST_SEASONS.map((season) => {
          const config = FOREST_THEMES[season];
          const active = theme === season;
          return (
            <button
              key={season}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Chọn theme ${config.label}`}
              title={config.label}
              onClick={() => onChange(season)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition-all md:h-9 md:w-9 ${
                active
                  ? "scale-110 shadow-md ring-2"
                  : "opacity-70 hover:opacity-100 hover:scale-105"
              }`}
              style={
                active
                  ? {
                      backgroundColor: "white",
                      boxShadow: `0 0 0 2px ${config.accent}`,
                    }
                  : undefined
              }
            >
              <span aria-hidden>{config.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
