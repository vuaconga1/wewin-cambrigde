"use client";

import type { ReactNode } from "react";

import { useForestThemeContextOptional } from "./ForestThemeContext";
import {
  getGameSeasonTheme,
  type GameSeasonTheme,
  type SeasonGameType,
} from "./gameSeasonThemes";
import type { ForestSeason } from "./themes";

export function useGameSeasonTheme(game: SeasonGameType): {
  season: ForestSeason;
  ui: GameSeasonTheme;
} {
  const ctx = useForestThemeContextOptional();
  const season = ctx?.theme ?? "spring";
  const ui = getGameSeasonTheme(season, game);
  return { season, ui };
}

type SeasonGamePanelProps = {
  game: SeasonGameType;
  children: ReactNode;
  className?: string;
  maxWidth?: "4xl" | "5xl" | "6xl" | "7xl";
  showStory?: boolean;
};

const MAX_W = {
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;

export function SeasonGamePanel({
  game,
  children,
  className = "",
  maxWidth = "5xl",
  showStory = false,
}: SeasonGamePanelProps) {
  const { ui } = useGameSeasonTheme(game);

  return (
    <section className="min-h-screen bg-transparent py-4 md:py-8 lg:py-10 px-1 md:px-4 lg:px-6">
      <div
        className={`rounded-xl md:rounded-2xl border p-3 md:p-6 mx-auto ${MAX_W[maxWidth]} ${ui.panel} ${ui.panelBorder} ${ui.panelShadow} ${className}`}
      >
        {showStory && (
          <div
            className={`mb-4 md:mb-5 flex items-start gap-3 rounded-xl border px-3 py-2.5 md:px-4 md:py-3 ${ui.storyBadge}`}
          >
            <span className="text-2xl md:text-3xl shrink-0" aria-hidden>
              {ui.storyEmoji}
            </span>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                {ui.storyTitle}
              </p>
              <p className="text-sm md:text-base font-medium leading-snug">
                {ui.storySubtitle}
              </p>
            </div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

type SeasonStoryBannerProps = {
  game: SeasonGameType;
  showSubtitle?: boolean;
  className?: string;
};

export function SeasonStoryBanner({
  game,
  showSubtitle = false,
  className = "",
}: SeasonStoryBannerProps) {
  const { ui } = useGameSeasonTheme(game);

  if (showSubtitle) {
    return (
      <div
        className={`mb-4 md:mb-6 mx-auto max-w-2xl flex items-start gap-3 rounded-2xl border px-4 py-3 md:px-5 md:py-4 text-left ${ui.storyBadge} ${className}`}
      >
        <span className="text-2xl md:text-3xl shrink-0" aria-hidden>
          {ui.storyEmoji}
        </span>
        <div className="min-w-0">
          <p className="text-sm md:text-base font-bold">{ui.storyTitle}</p>
          <p className="mt-0.5 text-xs md:text-sm font-medium leading-snug opacity-90">
            {ui.storySubtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-4 flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold mx-auto w-fit ${ui.storyBadge} ${className}`}
    >
      <span aria-hidden>{ui.storyEmoji}</span>
      <span>{ui.storyTitle}</span>
    </div>
  );
}
