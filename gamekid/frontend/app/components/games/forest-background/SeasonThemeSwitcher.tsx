"use client";

import { useEffect, useRef, useState } from "react";

import { FOREST_SEASONS, FOREST_THEMES, type ForestSeason } from "./themes";

type SeasonThemeSwitcherProps = {
  theme: ForestSeason;
  onChange: (season: ForestSeason) => void;
  /** Chỉ hiện icon mùa hiện tại; bấm mới xổ danh sách */
  compact?: boolean;
};

export function SeasonThemeSwitcher({
  theme,
  onChange,
  compact = false,
}: SeasonThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeConfig = FOREST_THEMES[theme];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  if (!compact) {
    return (
      <div role="radiogroup" aria-label="Chọn theme mùa">
        <div className="flex items-center gap-0.5 rounded-full border border-white/50 bg-white/70 p-1 shadow-md backdrop-blur-md sm:gap-1 sm:p-1.5">
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
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm transition-all sm:h-8 sm:w-8 sm:text-base md:h-9 md:w-9 ${
                  active
                    ? "scale-105 shadow-md ring-2 sm:scale-110"
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Chọn theme mùa"
        title={`Theme ${activeConfig.label}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/80 text-base shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105 sm:h-10 sm:w-10 sm:text-lg"
        style={{ boxShadow: `0 0 0 2px ${activeConfig.accent}55` }}
      >
        <span aria-hidden>{activeConfig.icon}</span>
      </button>

      {open ? (
        <div
          role="radiogroup"
          aria-label="Chọn theme mùa"
          className="absolute right-0 top-11 z-40 flex items-center gap-1 rounded-2xl border border-white/60 bg-white/95 p-1.5 shadow-xl backdrop-blur-md"
        >
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
                onClick={() => {
                  onChange(season);
                  setOpen(false);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition-all sm:h-9 sm:w-9 ${
                  active
                    ? "scale-110 shadow-md"
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
      ) : null}
    </div>
  );
}
