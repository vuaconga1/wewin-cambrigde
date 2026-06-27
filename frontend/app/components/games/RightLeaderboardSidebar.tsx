"use client";

import { useEffect, useMemo, useState } from "react";
import { leaderboardService, type LeaderboardRow } from "@/services/leaderboard.service";

type Props = {
  open: boolean;
  onToggle: () => void;
  unitSlug: string;
  partId: string;
  gameType: string;
  refreshToken?: number; // increment to refetch
};

export function RightLeaderboardSidebar({
  open,
  onToggle,
  unitSlug,
  partId,
  gameType,
  refreshToken,
}: Props) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizedPartId = (partId?.trim() || "default");

  const canLoad = useMemo(() => {
    return Boolean(unitSlug && gameType);
  }, [unitSlug, gameType]);

  useEffect(() => {
    if (!canLoad) return;

    let cancelled = false;
    setLoading(true);
    leaderboardService
      .getTop({ unitSlug, partId: normalizedPartId, gameType, limit: 10 })
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        console.error("Leaderboard fetch failed:", err);
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canLoad, unitSlug, normalizedPartId, gameType, refreshToken]);

  const widthClass = open
    ? "w-[min(92vw,320px)] md:w-[320px]"
    : "w-[56px] md:w-[56px]";

  return (
    <aside
      className={`fixed top-0 right-0 z-40 h-dvh ${widthClass} transition-all duration-300 md:rounded-l-3xl`}
      aria-label="Bảng xếp hạng"
    >
      <div className="relative h-full">
        {/* Toggle handle */}
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-3 md:left-0 md:right-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-full border border-white/30 bg-blue-600 text-white shadow-xl w-10 h-10 flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all"
          aria-label={open ? "Thu gọn bảng xếp hạng" : "Mở rộng bảng xếp hạng"}
        >
          {open ? "›" : "‹"}
        </button>

        {/* Panel */}
        <div className={
          `h-full md:rounded-l-3xl border-l shadow-2xl overflow-hidden ` +
          (open
            ? "bg-white border-gray-200"
            : "bg-gradient-to-r from-[#0a1435] to-[#122b6b] border-white/10")
        }>
          {/* Collapsed */}
          {!open && (
            <div className="h-full flex items-center justify-center">
              <div className="rotate-90 whitespace-nowrap text-white font-extrabold tracking-wider text-xs">
                LEADERBOARD
              </div>
            </div>
          )}

          {/* Expanded */}
          {open && (
            <div className="h-full flex flex-col">
              <header className={"px-5 py-4 border-b " + (open ? "border-gray-100" : "border-white/15") }>
                <div className="flex items-center justify-between">
                  <h3 className={open ? "text-slate-900 font-extrabold text-lg" : "text-white font-extrabold text-lg"}>
                    Bảng xếp hạng
                  </h3>
                  <span className={open ? "text-xs text-slate-500 font-semibold" : "text-xs text-blue-100/70 font-semibold"}>
                    Top 10
                  </span>
                </div>
                <p className={open ? "mt-1 text-xs text-slate-600" : "mt-1 text-xs text-blue-100/70"}>
                  {gameType.toUpperCase()} · {normalizedPartId === "default" ? "Part" : `Part ${normalizedPartId}`}
                </p>
              </header>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {loading ? (
                  <div className={open ? "px-2 py-6 text-slate-600 text-sm" : "px-2 py-6 text-blue-50/90 text-sm"}>
                    Đang tải...
                  </div>
                ) : rows.length === 0 ? (
                  <div className={open ? "px-2 py-6 text-slate-600 text-sm" : "px-2 py-6 text-blue-50/90 text-sm"}>
                    Chưa có điểm.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {rows.map((r, idx) => (
                      <li
                        key={`${r.studentId}-${idx}`}
                        className={open ? "rounded-2xl bg-white border border-gray-100 px-4 py-3" : "rounded-2xl bg-white/10 border border-white/15 px-4 py-3 backdrop-blur"}
                      >
                        <div className="flex items-center gap-3">
                          <div className={open ? "w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-slate-800 font-black" : "w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-black"}>
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (idx + 1).toString().padStart(2, "0")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={open ? "text-slate-900 font-bold truncate" : "text-white font-bold truncate"}>
                              {r.name || r.playerId}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={open ? "text-slate-900 font-black text-lg leading-none" : "text-white font-black text-lg leading-none"}>
                              {r.bestScore}
                            </div>
                            <div className={open ? "text-xs text-slate-500" : "text-xs text-blue-100/70"}>
                              điểm
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <footer className="px-5 py-3 border-t border-white/15 text-xs text-blue-100/70">
                Chỉ lưu điểm cao nhất mỗi học sinh.
              </footer>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

