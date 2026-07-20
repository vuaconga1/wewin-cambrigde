"use client";

import { BookOpen, Trophy } from "lucide-react";

import { GameBackButton } from "@/app/components/games/GameBackButton";

type GameMobileToolbarProps = {
  onBack: () => void;
  onOpenUnits?: () => void;
  onToggleLeaderboard?: () => void;
  showLeaderboard?: boolean;
  title: string;
  subtitle?: string;
};

const iconBtn =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all active:scale-95";

export function GameMobileToolbar({
  onBack,
  onOpenUnits,
  onToggleLeaderboard,
  showLeaderboard = false,
  title,
  subtitle,
}: GameMobileToolbarProps) {
  return (
    <header className="md:hidden sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5">
        <GameBackButton
          onClick={onBack}
          className="w-auto min-w-[4.5rem] px-2.5 py-0 shadow-sm"
        />

        <div className="min-w-0 px-1 text-center">
          <p className="truncate text-sm font-bold leading-tight text-[#0E4BA9]">
            {title}
          </p>
          {subtitle ? (
            <p className="truncate text-xs leading-tight text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {onOpenUnits ? (
            <button
              type="button"
              onClick={onOpenUnits}
              className={`${iconBtn} border-slate-200/80 bg-white text-[#1057C1] hover:bg-blue-50`}
              aria-label="Danh sách Unit"
            >
              <BookOpen className="h-5 w-5" strokeWidth={2.25} />
            </button>
          ) : null}
          {showLeaderboard && onToggleLeaderboard ? (
            <button
              type="button"
              onClick={onToggleLeaderboard}
              className={`${iconBtn} border-blue-500/30 bg-[#1057C1] text-white hover:bg-[#0c3e8c]`}
              aria-label="Bảng xếp hạng"
            >
              <Trophy className="h-5 w-5" strokeWidth={2.25} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
