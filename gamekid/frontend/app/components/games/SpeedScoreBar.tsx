"use client";

import {
  SPEED_SCORE_THEME,
  type SpeedScoreTheme,
} from "@/app/utils/speedScore";

type Props = {
  theme: SpeedScoreTheme;
  /** Điểm đã kiếm được */
  score: number;
  /** Tổng điểm tối đa của cả game (số câu × 100) */
  maxScore: number;
  visible?: boolean;
};

function formatScore(n: number): string {
  return n.toLocaleString("vi-VN");
}

export function SpeedScoreBar({
  theme,
  score,
  maxScore,
  visible = true,
}: Props) {
  if (!visible || maxScore <= 0) return null;

  const colors = SPEED_SCORE_THEME[theme];
  const percent = Math.min(100, Math.round((score / maxScore) * 100));

  return (
    <div className="mt-3 mb-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-0 sm:px-1">
      <div
        className={`shrink-0 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-md bg-gradient-to-r ${colors.bar} ring-2 ring-amber-300/80`}
      >
        <span className="text-sm" aria-hidden>
          ⭐
        </span>
        <span className="text-xs sm:text-sm font-black text-white tabular-nums whitespace-nowrap">
          {formatScore(score)}/{formatScore(maxScore)} điểm
        </span>
      </div>

      <div
        className={`relative h-3 sm:h-3.5 flex-1 min-w-0 rounded-full overflow-hidden ${colors.track} shadow-inner`}
      >
        <div
          className={`speed-score-bar-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colors.bar} shadow-md ${colors.glow} transition-[width] duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        >
          <div className="speed-score-bar-sparkle absolute inset-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
