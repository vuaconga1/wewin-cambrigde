"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Medal,
  Star,
} from "lucide-react";

import { BookUnitsSidebar } from "@/app/components/games/BookUnitsSidebar";
import { GameMobileToolbar } from "@/app/components/games/GameMobileToolbar";
import {
  ForestPageShell,
  getLeaderboardSeasonStyle,
  useForestTheme,
} from "@/app/components/games/forest-background";
import {
  BOOK_PLAYER_STORAGE_KEY,
  BOOK_TYPE_LABEL,
  BOOK_TYPE_TO_ROUTE,
} from "@/lib/games/bookRoutes";
import { resolveLeaderboardHome } from "@/lib/games/leaderboardNav";
import {
  leaderboardService,
  type MonthlyLeaderboardEntry,
  type MonthlyLeaderboardResponse,
} from "@/services/leaderboard.service";


type MonthlyLeaderboardPageProps = {
  bookType: string;
  bookName?: string;
  basePath: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatScore(score: number) {
  return score.toLocaleString("vi-VN");
}

function vietnamNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());
  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
  };
}

function Avatar({
  name,
  size = "md",
  avatarClass,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  avatarClass: string;
}) {
  const sizeClass =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : size === "sm"
        ? "h-10 w-10 text-sm"
        : "h-12 w-12 text-base";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold shadow-md ring-2 ring-white/90 ${sizeClass} ${avatarClass}`}
    >
      {getInitials(name)}
    </div>
  );
}

function PodiumSlot({
  entry,
  place,
  avatarClass,
  badgeClass,
  scoreClass,
  seasonIcon,
}: {
  entry?: MonthlyLeaderboardEntry;
  place: 1 | 2 | 3;
  avatarClass: string;
  badgeClass: string;
  scoreClass: string;
  seasonIcon: string;
}) {
  const pedestal =
    place === 1
      ? "h-36 bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-500 shadow-amber-400/40"
      : place === 2
        ? "h-28 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 shadow-slate-400/30"
        : "h-24 bg-gradient-to-b from-orange-300 via-amber-600 to-orange-800 shadow-orange-500/30";
  const order = place === 1 ? "order-2" : place === 2 ? "order-1" : "order-3";
  const badge =
    place === 1 ? (
      <Crown className="h-5 w-5 text-amber-400 drop-shadow" />
    ) : place === 2 ? (
      <Medal className="h-5 w-5 text-slate-300 drop-shadow" />
    ) : (
      <Medal className="h-5 w-5 text-amber-700 drop-shadow" />
    );

  return (
    <div className={`relative flex flex-1 flex-col items-center ${order}`}>
      <span
        className="pointer-events-none absolute -top-1 right-2 text-sm opacity-80 sm:right-4 sm:text-base"
        aria-hidden
      >
        {seasonIcon}
      </span>
      <div className="relative mb-2 flex flex-col items-center">
        <div className="mb-1">{badge}</div>
        {entry ? (
          <Avatar
            name={entry.name || entry.playerId}
            size={place === 1 ? "lg" : "md"}
            avatarClass={avatarClass}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/70 text-slate-400 shadow-sm backdrop-blur-sm">
            —
          </div>
        )}
        <p
          className={`mt-2 max-w-[7.5rem] truncate text-center text-sm font-bold sm:max-w-[9rem] ${scoreClass}`}
        >
          {entry?.name || "Chưa có"}
        </p>
        {entry ? (
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${badgeClass}`}
            >
              #{entry.rank}
            </span>
            <span className={`text-sm font-bold ${scoreClass}`}>
              {formatScore(entry.totalScore)}
            </span>
          </div>
        ) : null}
      </div>
      <div
        className={`relative flex w-full max-w-[7rem] items-end justify-center overflow-hidden rounded-t-2xl shadow-lg sm:max-w-[8.5rem] ${pedestal}`}
      >
        <span
          className="pointer-events-none absolute left-1 top-2 text-xs opacity-70"
          aria-hidden
        >
          {seasonIcon}
        </span>
        <span className="pb-3 text-4xl font-black text-white/95 drop-shadow">
          {place}
        </span>
      </div>
    </div>
  );
}

export function MonthlyLeaderboardPage({
  bookType,
  bookName,
  basePath,
}: MonthlyLeaderboardPageProps) {
  const router = useRouter();
  const { theme: season } = useForestTheme();
  const ui = useMemo(() => getLeaderboardSeasonStyle(season), [season]);

  const now = useMemo(() => vietnamNow(), []);
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyLeaderboardResponse | null>(null);
  const [playerId, setPlayerId] = useState("");

  const label = bookName || BOOK_TYPE_LABEL[bookType] || bookType;
  const routeSeg = BOOK_TYPE_TO_ROUTE[bookType] ?? bookType;
  const backHref = `/games/${routeSeg}`;
  const homeHref = resolveLeaderboardHome(backHref);

  const handleBack = () => {
    router.push(homeHref);
  };

  useEffect(() => {
    const key = BOOK_PLAYER_STORAGE_KEY[bookType];
    const raw = key ? localStorage.getItem(key) : "";
    setPlayerId(!raw || raw === "anonymous" ? "" : raw);
  }, [bookType]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaderboardService.getMonthlyTop({
        bookType,
        year,
        month,
        limit: 50,
        playerId: playerId || undefined,
      });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [bookType, year, month, playerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const top1 = data?.rows.find((r) => r.rank === 1);
  const top2 = data?.rows.find((r) => r.rank === 2);
  const top3 = data?.rows.find((r) => r.rank === 3);
  const rest = data?.rows.filter((r) => r.rank > 3) ?? [];
  const me = data?.me;

  return (
    <ForestPageShell showThemeSwitcher>
      <div className="flex min-h-screen md:items-stretch">
        <BookUnitsSidebar
          bookType={bookType}
          bookName={label}
          basePath={basePath}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="relative flex min-h-screen flex-1 flex-col pb-28">
          <GameMobileToolbar
            onBack={handleBack}
            onOpenUnits={() => setSidebarOpen(true)}
            title="Bảng xếp hạng"
            subtitle={label}
          />

          {/* Desktop header */}
          <header className="relative z-10 hidden items-center justify-center px-8 py-4 md:flex">
            <button
              type="button"
              onClick={handleBack}
              className={`absolute left-8 top-4 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm backdrop-blur-md transition ${ui.backBtn}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </button>
            <h1
              className={`text-2xl font-black drop-shadow-sm md:text-3xl ${ui.heading}`}
            >
              Bảng xếp hạng
            </h1>
          </header>

          <span
            className="pointer-events-none absolute left-4 top-28 text-xl opacity-60 md:left-10 md:top-24 md:text-3xl"
            aria-hidden
          >
            {ui.decor[0]}
          </span>
          <span
            className="pointer-events-none absolute right-4 top-32 text-lg opacity-50 md:right-16 md:top-28 md:text-2xl"
            aria-hidden
          >
            {ui.decor[1]}
          </span>

          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 pb-4 pt-3 sm:px-4 md:px-6 md:pt-2">
            <div className="mb-5 flex items-center justify-center gap-2 sm:mb-6 sm:gap-3">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-md sm:h-10 sm:w-10 ${ui.monthBtn}`}
                aria-label="Tháng trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div
                className={`min-w-[9.5rem] rounded-full border border-white/50 bg-white/80 px-3 py-1.5 text-center text-base font-black uppercase tracking-wide shadow-md backdrop-blur-md sm:min-w-[10rem] sm:px-4 sm:text-lg ${ui.monthLabel}`}
              >
                Tháng {month}/{year}
              </div>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-md sm:h-10 sm:w-10 ${ui.monthBtn}`}
                aria-label="Tháng sau"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <p className={`py-16 text-center font-medium ${ui.subtext}`}>
                Đang tải bảng xếp hạng…
              </p>
            ) : (
              <>
                <div className="mb-6 flex items-end justify-center gap-1.5 px-1 sm:mb-8 sm:gap-4 sm:px-2">
                  <PodiumSlot
                    entry={top2}
                    place={2}
                    avatarClass={ui.avatar}
                    badgeClass={ui.badge}
                    scoreClass={ui.score}
                    seasonIcon={ui.icon}
                  />
                  <PodiumSlot
                    entry={top1}
                    place={1}
                    avatarClass={ui.avatar}
                    badgeClass={ui.badge}
                    scoreClass={ui.score}
                    seasonIcon={ui.icon}
                  />
                  <PodiumSlot
                    entry={top3}
                    place={3}
                    avatarClass={ui.avatar}
                    badgeClass={ui.badge}
                    scoreClass={ui.score}
                    seasonIcon={ui.icon}
                  />
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {rest.length === 0 && !top1 ? (
                    <div
                      className={`relative overflow-hidden rounded-3xl border px-4 py-8 text-center text-sm shadow-md backdrop-blur-md sm:py-10 sm:text-base ${ui.panel}`}
                    >
                      <span className="mb-3 block text-3xl" aria-hidden>
                        {ui.emptyIcon}
                      </span>
                      Chưa có điểm trong tháng này. Hãy chơi game để lên bảng!
                      <span
                        className="pointer-events-none absolute -right-1 -top-1 text-2xl opacity-70"
                        aria-hidden
                      >
                        {ui.decor[0]}
                      </span>
                      <span
                        className="pointer-events-none absolute -bottom-1 left-2 text-xl opacity-60"
                        aria-hidden
                      >
                        {ui.decor[1]}
                      </span>
                    </div>
                  ) : null}
                  {rest.map((row) => (
                    <div
                      key={row.studentId}
                      className={`relative flex items-center gap-2.5 overflow-hidden rounded-2xl border px-3 py-2.5 shadow-md backdrop-blur-md sm:gap-3 sm:px-4 sm:py-3 ${ui.row}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-9 sm:w-9 sm:text-sm ${ui.rankCircle}`}
                      >
                        {row.rank}
                      </div>
                      <Avatar
                        name={row.name || row.playerId}
                        size="sm"
                        avatarClass={ui.avatar}
                      />
                      <div
                        className={`min-w-0 flex-1 truncate text-sm font-bold sm:text-base ${ui.score}`}
                      >
                        {row.name || row.playerId}
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${ui.badge}`}
                      >
                        #{row.rank}
                      </span>
                      <div
                        className={`flex items-center gap-1 text-sm font-bold sm:text-base ${ui.score}`}
                      >
                        <Star className={`h-4 w-4 ${ui.star}`} />
                        {formatScore(row.totalScore)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {me && me.rank > 0 ? (
            <div className="fixed bottom-4 left-3 right-3 z-40 mx-auto max-w-3xl md:left-[calc(50%+9rem)] md:right-auto md:w-[min(100%-1.5rem,48rem)] md:-translate-x-1/2">
              <div
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-xl ${ui.footer}`}
              >
                <span className={`text-sm font-bold ${ui.footerAccent}`}>
                  Hạng {me.rank}
                </span>
                <Avatar
                  name={me.name || me.playerId}
                  size="sm"
                  avatarClass={ui.avatar}
                />
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {me.name || me.playerId}
                </span>
                <span className={`text-lg font-black ${ui.footerAccent}`}>
                  {formatScore(me.totalScore)}
                </span>
                <span className="text-base opacity-90" aria-hidden>
                  {ui.icon}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ForestPageShell>
  );
}
