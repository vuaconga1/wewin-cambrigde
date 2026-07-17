"use client";

import { useEffect, useMemo, useState } from "react";
import { leaderboardService, type LeaderboardRow } from "@/services/leaderboard.service";

type Props = {
  open: boolean;
  onToggle: () => void;
  unitSlug: string;
  partId: string;
  gameType: string;
  refreshToken?: number;
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

  const normalizedPartId = partId?.trim() || "default";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) return;

    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const desktopWidthClass = open ? "md:w-[320px]" : "md:w-[56px]";

  return (
    <>
      {/* Mobile: backdrop when expanded */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-dvh transition-all duration-300 md:rounded-l-3xl ${desktopWidthClass} ${
          open
            ? "w-[min(92vw,320px)] translate-x-0"
            : "max-md:w-0 max-md:translate-x-full max-md:overflow-hidden max-md:pointer-events-none"
        }`}
        aria-label="Bảng xếp hạng"
      >
        <div className="relative h-full">
          {/* Desktop toggle handle */}
          <button
            type="button"
            onClick={onToggle}
            className="hidden md:flex absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-blue-600 text-white shadow-xl w-10 h-10 items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all"
            aria-label={open ? "Thu gọn bảng xếp hạng" : "Mở rộng bảng xếp hạng"}
          >
            {open ? "›" : "‹"}
          </button>

          {/* Mobile close when expanded */}
          {open && (
            <button
              type="button"
              onClick={onToggle}
              className="md:hidden absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
              aria-label="Đóng bảng xếp hạng"
            >
              ✕
            </button>
          )}

          <div
            className={
              `h-full md:rounded-l-3xl border-l shadow-2xl overflow-hidden ` +
              (open
                ? "bg-white border-gray-200"
                : "bg-gradient-to-r from-[#0a1435] to-[#122b6b] border-white/10")
            }
          >
            {/* Collapsed — desktop only strip */}
            {!open && (
              <div className="hidden md:flex h-full items-center justify-center">
                <div className="rotate-90 whitespace-nowrap text-white font-extrabold tracking-wider text-xs">
                  LEADERBOARD
                </div>
              </div>
            )}

            {/* Expanded */}
            {open && (
              <div className="h-full flex flex-col">
                <header className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between pr-10 md:pr-0">
                    <h3 className="text-slate-900 font-extrabold text-lg">
                      Bảng xếp hạng
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">
                      Top 10
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {gameType.toUpperCase()} ·{" "}
                    {normalizedPartId === "default"
                      ? "Part"
                      : `Part ${normalizedPartId}`}
                  </p>
                </header>

                <div className="flex-1 overflow-y-auto px-3 py-3">
                  {loading ? (
                    <div className="px-2 py-6 text-slate-600 text-sm">
                      Đang tải...
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="px-2 py-6 text-slate-600 text-sm">
                      Chưa có điểm.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {rows.map((r, idx) => (
                        <li
                          key={`${r.studentId}-${idx}`}
                          className="rounded-2xl bg-white border border-gray-100 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-slate-800 font-black shrink-0">
                              {idx === 0
                                ? "🥇"
                                : idx === 1
                                  ? "🥈"
                                  : idx === 2
                                    ? "🥉"
                                    : (idx + 1).toString().padStart(2, "0")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-slate-900 font-bold truncate">
                                {r.name || r.playerId}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-slate-900 font-black text-lg leading-none">
                                {r.bestScore}
                              </div>
                              <div className="text-xs text-slate-500">điểm</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <footer className="px-5 py-3 border-t border-gray-100 text-xs text-slate-500">
                  Chỉ lưu điểm cao nhất mỗi học sinh.
                </footer>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
