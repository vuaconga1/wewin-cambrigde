/** Max points per question/pair when answered instantly. */
export const SPEED_SCORE_MAX = 100;

/** Minimum points if answered before time runs out. */
export const SPEED_SCORE_MIN = 10;

/** No decay during this window: answering within 3s gives full points. */
export const SPEED_SCORE_GRACE_MS = 3_000;

/** After this many ms, score reaches ~37% of max (smooth decay). */
export const SPEED_SCORE_HALF_LIFE_MS = 12_000;

/** Hard cap — after this, only minimum points remain. */
export const SPEED_SCORE_CAP_MS = 45_000;

/**
 * Full score during grace time, then exponential decay by elapsed milliseconds.
 * Millisecond precision makes identical scores very unlikely.
 */
export function potentialSpeedScore(elapsedMs: number): number {
  if (elapsedMs <= SPEED_SCORE_GRACE_MS) return SPEED_SCORE_MAX;

  const decayMs = elapsedMs - SPEED_SCORE_GRACE_MS;
  const clamped = Math.max(0, Math.min(decayMs, SPEED_SCORE_CAP_MS));
  const raw =
    SPEED_SCORE_MAX *
    Math.exp((-clamped / SPEED_SCORE_HALF_LIFE_MS) * Math.LN2);
  return Math.max(SPEED_SCORE_MIN, Math.round(raw));
}

/** 0–100 for progress bar fill (100 = full points still available). */
export function speedScorePercent(elapsedMs: number): number {
  const score = potentialSpeedScore(elapsedMs);
  const range = SPEED_SCORE_MAX - SPEED_SCORE_MIN;
  return Math.round(((score - SPEED_SCORE_MIN) / range) * 100);
}

export type SpeedScoreTheme = "memory" | "ordering" | "scramble" | "speak";

export const SPEED_SCORE_THEME: Record<
  SpeedScoreTheme,
  { bar: string; glow: string; text: string; track: string }
> = {
  memory: {
    bar: "from-orange-400 via-amber-400 to-orange-500",
    glow: "shadow-orange-300/60",
    text: "text-orange-700",
    track: "bg-orange-100",
  },
  ordering: {
    bar: "from-red-400 via-rose-400 to-red-500",
    glow: "shadow-red-300/60",
    text: "text-red-700",
    track: "bg-red-100",
  },
  scramble: {
    bar: "from-pink-400 via-fuchsia-400 to-pink-500",
    glow: "shadow-pink-300/60",
    text: "text-pink-700",
    track: "bg-pink-100",
  },
  speak: {
    bar: "from-emerald-400 via-green-400 to-emerald-500",
    glow: "shadow-emerald-300/60",
    text: "text-emerald-700",
    track: "bg-emerald-100",
  },
};
