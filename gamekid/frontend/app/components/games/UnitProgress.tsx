"use client";

import { useState } from "react";
import type { GameKey } from "@/types/games";
import { useGameSeasonTheme } from "@/app/components/games/forest-background";

type UnitProgressProps = {
  title: string;
  games: GameKey[];
  progress: Record<GameKey, boolean>;
  scores: Record<GameKey, number>;
  onReset?: () => void;
  externalIsOpen?: boolean;
  onExternalToggle?: () => void;
};

const GAME_META: Record<GameKey, { icon: string; label: string }> = {
  matching: { icon: "🧩", label: "Matching Game" },
  flip: { icon: "🔊", label: "Flip Card Game" },
  speak: { icon: "📚", label: "Pronunciation Game" },
  memory: { icon: "🧠", label: "Memory Game" },
  ordering: { icon: "🔤", label: "Word Ordering Game" },
  scramble: { icon: "🧩", label: "Word Scramble Game" },
};

export function UnitProgress({
  title,
  games,
  progress,
  scores,
  onReset,
  externalIsOpen,
  onExternalToggle,
}: UnitProgressProps) {
  const { ui } = useGameSeasonTheme("menu");
  const allCompleted = games.every((key) => progress[key]);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Dùng external state nếu có, không thì dùng internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = () => {
    if (onExternalToggle) {
      onExternalToggle();
    } else {
      setInternalIsOpen((v) => !v);
    }
  };

  const completedCount = games.filter((key) => progress[key]).length;
  const totalScore = games.reduce((sum, key) => sum + (scores[key] || 0), 0);

  return (
    <div className="fixed bottom-4 left-3 right-auto sm:left-auto sm:right-4 z-[1001] flex flex-col items-start sm:items-end gap-2 max-w-[calc(100%-1.5rem)]">
      {/* Nút thu gọn / mở rộng */}
      <button
        data-progress-button
        onClick={toggleOpen}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg border hover:shadow-xl hover:scale-102 transition-all duration-300 ${ui.primaryBtn || "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400/20 shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"}`}
      >
        <span>📊</span>
        <span className="hidden sm:inline">
          Tiến độ: {completedCount}/{games.length}
        </span>
        <span className="sm:hidden">
          {completedCount}/{games.length}
        </span>
        <span>{isOpen ? "▼" : "▲"}</span>
      </button>

      {/* Panel chi tiết - chỉ render khi mở để tránh che mất các phần tử khác */}
      {isOpen && (
        <div className="origin-bottom-left sm:origin-bottom-right transform transition-all duration-300 scale-100 opacity-100 translate-y-0 animate-fadeIn">
          <div className={`p-5 sm:p-6 rounded-3xl shadow-2xl border text-sm max-w-xs ${ui.panel} ${ui.panelBorder}`}>
          <h3 className={`mb-4 text-base sm:text-lg font-bold flex items-center gap-2 border-b pb-2 ${ui.heading} ${ui.statDivider}`}>
            <span>📊</span>
            <span className="truncate max-w-[180px]">{title}</span>
          </h3>

          <div className="space-y-2.5">
            {games.map((key) => {
              const meta = GAME_META[key];
              const isDone = progress[key] || false;
              const score = scores[key] || 0;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
                    isDone ? ui.statusSuccess : `${ui.statBg} ${ui.subtext} border-slate-100`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="text-xs font-semibold">{meta.label}</span>
                  </div>
                  <div className="flex items-center">
                    {isDone ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ui.statusSuccess}`}>
                        {score > 0 ? `${score}đ` : "Xong"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                        Chưa chơi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {allCompleted && onReset && (
            <button
              onClick={onReset}
              className="mt-4 w-full bg-red-500/90 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-red-600 shadow-md shadow-red-500/10 hover:shadow-lg transition-all duration-300"
            >
              🔄 Reset Tiến Độ
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

