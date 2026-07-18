"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Trophy } from "lucide-react";

import { BackgroundMusicControls } from "@/app/components/audio";
import { isFullscreenGameRoute } from "@/lib/constants/routes";

import { FantasyForestBackground } from "./FantasyForestBackground";
import { ForestThemeProvider } from "./ForestThemeContext";
import { SeasonThemeSwitcher } from "./SeasonThemeSwitcher";
import { useForestTheme } from "./useForestTheme";

type LeaderboardMenuItem = {
  label: string;
  href: string;
};

type ForestPageShellProps = {
  children: ReactNode;
  /** Chỉ bật ở màn chọn topic / loại game */
  showThemeSwitcher?: boolean;
  /** Link thẳng tới bảng xếp hạng tháng của 1 sách */
  leaderboardHref?: string;
  /** Menu chọn sách (trang overview) */
  leaderboardMenu?: LeaderboardMenuItem[];
};

const trophyBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/80 text-amber-400 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105 sm:h-10 sm:w-10";

export function ForestPageShell({
  children,
  showThemeSwitcher = false,
  leaderboardHref,
  leaderboardMenu,
}: ForestPageShellProps) {
  const pathname = usePathname();
  const isFullscreen = isFullscreenGameRoute(pathname);
  const forestTheme = useForestTheme();
  const { theme, setTheme, config } = forestTheme;
  const [reducedMotion, setReducedMotion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const showLeaderboard = Boolean(leaderboardHref || leaderboardMenu?.length);

  // Fullscreen (/games/...): không có navbar global → góc phải trên.
  // Mobile tránh đè GameMobileToolbar. Trang /games có navbar → top-20.
  const controlsPosition = isFullscreen
    ? "top-14 right-2 sm:right-3 md:top-3 md:right-4"
    : "top-20 right-2 pt-2 sm:right-3 md:right-4 md:pt-3";

  return (
    <ForestThemeProvider value={forestTheme}>
      <div className="relative min-h-screen">
        <FantasyForestBackground config={config} reducedMotion={reducedMotion} />
        <div className="relative z-10">{children}</div>

        <div
          className={`pointer-events-none fixed z-[60] flex items-center justify-end gap-1.5 sm:gap-2 ${controlsPosition}`}
        >
          {showLeaderboard ? (
            <div className="pointer-events-auto relative">
              {leaderboardHref ? (
                <Link
                  href={leaderboardHref}
                  aria-label="Bảng xếp hạng tháng"
                  title="Bảng xếp hạng tháng"
                  className={trophyBtnClass}
                >
                  <Trophy className="h-4 w-4 fill-amber-400 sm:h-5 sm:w-5" />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Bảng xếp hạng tháng"
                    title="Bảng xếp hạng tháng"
                    className={trophyBtnClass}
                  >
                    <Trophy className="h-4 w-4 fill-amber-400 sm:h-5 sm:w-5" />
                  </button>
                  {menuOpen && leaderboardMenu ? (
                    <div className="absolute right-0 top-11 z-50 min-w-[11rem] overflow-hidden rounded-2xl border border-white/60 bg-white/95 py-1 shadow-xl backdrop-blur-md">
                      {leaderboardMenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#0E4BA9]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          <div className="pointer-events-auto">
            <BackgroundMusicControls compact />
          </div>

          {showThemeSwitcher ? (
            <div className="pointer-events-auto">
              <SeasonThemeSwitcher
                theme={theme}
                onChange={setTheme}
                compact
              />
            </div>
          ) : null}
        </div>
      </div>
    </ForestThemeProvider>
  );
}
