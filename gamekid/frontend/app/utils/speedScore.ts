/** Max points per question/pair when answered instantly. */
export const SPEED_SCORE_MAX = 100;

/** Minimum points if answered before time runs out. */
export const SPEED_SCORE_MIN = 10;

/** Default: no decay during this window (full points). */
export const SPEED_SCORE_GRACE_MS = 3_000;

/** Word Ordering: 15s đầu giữ nguyên 100 điểm. */
export const ORDERING_SCORE_GRACE_MS = 15_000;

/** After this many ms past grace, score reaches ~37% of max (smooth decay). */
export const SPEED_SCORE_HALF_LIFE_MS = 12_000;

/** Hard cap — after this, only minimum points remain. */
export const SPEED_SCORE_CAP_MS = 45_000;

/** Base points for one matched Memory pair (before flip penalties). */
export const MEMORY_PAIR_SCORE = 100;

/** Extra flips beyond 2 on a Memory card cost this many points each. */
export const MEMORY_EXTRA_FLIP_PENALTY = 5;

/**
 * Full score during grace time, then exponential decay by elapsed milliseconds.
 * Millisecond precision makes identical scores very unlikely.
 */
export function potentialSpeedScore(
  elapsedMs: number,
  graceMs: number = SPEED_SCORE_GRACE_MS,
): number {
  if (elapsedMs <= graceMs) return SPEED_SCORE_MAX;

  const decayMs = elapsedMs - graceMs;
  const clamped = Math.max(0, Math.min(decayMs, SPEED_SCORE_CAP_MS));
  const raw =
    SPEED_SCORE_MAX *
    Math.exp((-clamped / SPEED_SCORE_HALF_LIFE_MS) * Math.LN2);
  return Math.max(SPEED_SCORE_MIN, Math.round(raw));
}

/** 0–100 for progress bar fill (100 = full points still available). */
export function speedScorePercent(
  elapsedMs: number,
  graceMs: number = SPEED_SCORE_GRACE_MS,
): number {
  const score = potentialSpeedScore(elapsedMs, graceMs);
  const range = SPEED_SCORE_MAX - SPEED_SCORE_MIN;
  return Math.round(((score - SPEED_SCORE_MIN) / range) * 100);
}

/** Penalty for flips beyond the free 2 views on a single Memory card. */
export function memoryFlipPenalty(flipCount: number): number {
  return Math.max(0, flipCount - 2) * MEMORY_EXTRA_FLIP_PENALTY;
}

/** Points for a matched Memory pair given flip counts of both cards. */
export function memoryPairPoints(flipCountA: number, flipCountB: number): number {
  const penalty = memoryFlipPenalty(flipCountA) + memoryFlipPenalty(flipCountB);
  return Math.max(0, MEMORY_PAIR_SCORE - penalty);
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
