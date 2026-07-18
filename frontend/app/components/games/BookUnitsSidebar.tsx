"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import {
  getSidebarSeasonStyle,
  useForestTheme,
} from "@/app/components/games/forest-background";
import { gameService } from "@/services/game.service";
import type { UnitGameConfig } from "@/types/games";

type BookUnitsSidebarProps = {
  bookType: string;
  bookName?: string;
  basePath: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export function BookUnitsSidebar({
  bookType,
  bookName,
  basePath,
  isOpen = false,
  onClose,
}: BookUnitsSidebarProps) {
  const pathname = usePathname();
  const { theme: season } = useForestTheme();
  const seasonUi = useMemo(() => getSidebarSeasonStyle(season), [season]);

  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState<UnitGameConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const theme = useMemo(
    () => ({
      asideBg: "bg-slate-50/95 backdrop-blur-md",
      headerFooterBg: seasonUi.headerBg,
      headerFooterText: "text-white",
      headerFooterSubText: seasonUi.headerSubText,
      border: "border-slate-200/80",
      itemText: "text-slate-600",
      itemTextActive: seasonUi.itemTextActive,
      itemActiveBg: seasonUi.itemActiveBg,
      itemHoverBg: "hover:bg-slate-200/50 hover:scale-[1.01]",
      iconBoxBg: "bg-slate-200/80 text-black",
      iconBoxActiveBg: seasonUi.iconBoxActiveBg,
      iconColor: seasonUi.iconColor,
      toggleBtnBg: seasonUi.toggleBtnBg,
    }),
    [seasonUi],
  );

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      setLoading(true);
      const units = await gameService.getGamesByType(bookType);

      if (!cancelled) {
        setProjects(units);
        setLoading(false);
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [bookType]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.innerWidth < 768) {
      document.body.style.overflow = isOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }

    return undefined;
  }, [isOpen]);

  const resolvedBookName = useMemo(
    () => bookName || projects[0]?.bookname || "Games",
    [bookName, projects],
  );

  const widthClass = collapsed ? "w-72 md:w-[56px]" : "w-72";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const asideClasses = `fixed md:static top-0 md:top-0 left-0 h-screen md:h-auto md:min-h-full md:self-stretch flex flex-col ${widthClass} ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} md:flex overflow-visible z-[60]`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={asideClasses}>
        <div className="relative h-full w-full">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`hidden md:flex absolute right-0 top-1/2 z-20 h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-white shadow-xl transition-all hover:scale-105 ${theme.toggleBtnBg}`}
            aria-label={
              collapsed ? "Mở rộng danh sách unit" : "Thu gọn danh sách unit"
            }
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <div
            className={`flex h-full w-full flex-col overflow-hidden border-r ${theme.border} ${theme.asideBg} shadow-xl transition-all duration-300`}
          >
            {collapsed ? (
              <div
                className={`relative flex h-full items-center justify-center overflow-hidden ${theme.headerFooterBg}`}
              >
                <span
                  className="pointer-events-none absolute left-1 top-3 text-lg opacity-80"
                  aria-hidden
                >
                  {seasonUi.icon}
                </span>
                <span
                  className="pointer-events-none absolute bottom-4 right-1 text-base opacity-70"
                  aria-hidden
                >
                  {seasonUi.icon}
                </span>
                <div className="rotate-90 whitespace-nowrap text-xs font-extrabold tracking-wider text-white">
                  UNIT
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`relative flex flex-shrink-0 items-center gap-3 overflow-hidden px-4 py-4 ${theme.headerFooterBg}`}
                >
                  <span
                    className="pointer-events-none absolute -right-1 -top-1 text-2xl opacity-90 drop-shadow-sm rotate-[18deg]"
                    aria-hidden
                  >
                    {seasonUi.icon}
                  </span>
                  <span
                    className="pointer-events-none absolute bottom-1 right-8 text-sm opacity-70 rotate-[-12deg]"
                    aria-hidden
                  >
                    {seasonUi.icon}
                  </span>

                  <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm ring-2 ring-white/40"
                    style={{ boxShadow: `0 0 0 2px ${seasonUi.accent}55` }}
                  >
                    <BookOpen className={`h-5 w-5 ${theme.iconColor}`} />
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <div
                      className={`text-sm font-extrabold tracking-wide ${theme.headerFooterText}`}
                    >
                      {resolvedBookName}
                    </div>
                    <div
                      className={`text-[11px] font-medium ${theme.headerFooterSubText}`}
                    >
                      Chọn Unit để chuyển nhanh
                    </div>
                  </div>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/20 md:hidden"
                    >
                      <X className={`h-5 w-5 ${theme.headerFooterText}`} />
                    </button>
                  )}
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto p-3">
                  {loading && !projects.length ? (
                    <div className="px-3 py-2 text-xs text-gray-500">
                      Đang tải dữ liệu...
                    </div>
                  ) : (
                    projects.map((project, idx) => {
                      const href = `${basePath}/${project.slug}`;
                      const active = isActive(href);

                      return (
                        <Link
                          key={project.slug}
                          href={href}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              onClose?.();
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 group ${
                            active
                              ? theme.itemActiveBg
                              : "rounded-xl " + theme.itemHoverBg
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                              active
                                ? theme.iconBoxActiveBg
                                : theme.iconBoxBg
                            }`}
                          >
                            {(idx + 1).toString().padStart(2, "0")}
                          </div>
                          <span
                            className={`min-w-0 flex-1 text-[14px] line-clamp-2 ${
                              active
                                ? "font-bold " + theme.itemTextActive
                                : "font-bold " + theme.itemText
                            }`}
                          >
                            {project.name}
                          </span>
                          {active ? (
                            <span
                              className="pointer-events-none shrink-0 text-base opacity-90"
                              aria-hidden
                            >
                              {seasonUi.icon}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })
                  )}
                </nav>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
