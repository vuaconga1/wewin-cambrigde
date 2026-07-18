"use client";

import { useForestThemeContextOptional } from "./ForestThemeContext";
import type { ForestSeason } from "./themes";

type DecorSpec = {
  emoji: string;
  className: string;
};

const CARD_DECORS: Record<ForestSeason, DecorSpec[]> = {
  spring: [
    { emoji: "🌸", className: "left-1 top-1 text-xl rotate-[-18deg] sm:left-2 sm:top-2 sm:text-2xl md:text-3xl" },
    { emoji: "🌸", className: "right-1 top-1.5 text-lg rotate-[22deg] sm:right-2 sm:top-2 sm:text-xl md:text-2xl" },
    { emoji: "💮", className: "bottom-2 left-1.5 text-base rotate-[12deg] opacity-80 sm:bottom-3 sm:left-2 sm:text-lg" },
    { emoji: "🌸", className: "bottom-1.5 right-1.5 text-xl rotate-[-14deg] sm:bottom-2 sm:right-2 sm:text-2xl md:text-3xl" },
  ],
  summer: [
    { emoji: "☀️", className: "left-1 top-1 text-xl rotate-[-8deg] sm:left-2 sm:top-2 sm:text-2xl md:text-3xl" },
    { emoji: "🌻", className: "right-1 top-1.5 text-lg rotate-[16deg] sm:right-2 sm:top-2 sm:text-xl md:text-2xl" },
    { emoji: "✨", className: "bottom-2 left-1.5 text-base rotate-[10deg] opacity-85 sm:bottom-3 sm:left-2 sm:text-lg" },
    { emoji: "🌼", className: "bottom-1.5 right-1.5 text-xl rotate-[-12deg] sm:bottom-2 sm:right-2 sm:text-2xl md:text-3xl" },
  ],
  autumn: [
    { emoji: "🍂", className: "left-1 top-1 text-xl rotate-[-24deg] sm:left-2 sm:top-2 sm:text-2xl md:text-3xl" },
    { emoji: "🍁", className: "right-1 top-1.5 text-lg rotate-[20deg] sm:right-2 sm:top-2 sm:text-xl md:text-2xl" },
    { emoji: "🍂", className: "bottom-2 left-1.5 text-base rotate-[18deg] opacity-85 sm:bottom-3 sm:left-2 sm:text-lg" },
    { emoji: "🍁", className: "bottom-1.5 right-1.5 text-xl rotate-[-16deg] sm:bottom-2 sm:right-2 sm:text-2xl md:text-3xl" },
  ],
  winter: [
    { emoji: "❄️", className: "left-1 top-1 text-xl rotate-[-12deg] sm:left-2 sm:top-2 sm:text-2xl md:text-3xl" },
    { emoji: "❄️", className: "right-1 top-1.5 text-lg rotate-[18deg] sm:right-2 sm:top-2 sm:text-xl md:text-2xl" },
    { emoji: "⛄", className: "bottom-2 left-1.5 text-base rotate-[8deg] opacity-85 sm:bottom-3 sm:left-2 sm:text-lg" },
    { emoji: "❄️", className: "bottom-1.5 right-1.5 text-xl rotate-[-20deg] sm:bottom-2 sm:right-2 sm:text-2xl md:text-3xl" },
  ],
};

type SeasonCardDecorProps = {
  /** Side cards: slightly smaller / fewer accents */
  compact?: boolean;
};

export function SeasonCardDecor({ compact = false }: SeasonCardDecorProps) {
  const ctx = useForestThemeContextOptional();
  const season = ctx?.theme ?? "spring";
  const decors = CARD_DECORS[season];
  const visible = compact ? decors.filter((_, i) => i % 2 === 0) : decors;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      {visible.map((decor, index) => (
        <span
          key={`${season}-${index}`}
          className={`absolute drop-shadow-sm select-none ${decor.className} ${
            compact ? "opacity-70 scale-90" : "opacity-90"
          }`}
        >
          {decor.emoji}
        </span>
      ))}
    </div>
  );
}
