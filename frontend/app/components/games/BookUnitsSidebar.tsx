"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

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
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState<UnitGameConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Chọn màu sắc thống nhất (Sidebar trắng, Header/Footer xanh)
  const theme = useMemo(() => {
    return {
      asideBg: "bg-slate-50/95 backdrop-blur-md",
      headerFooterBg: "bg-gradient-to-r from-[#0a1435] to-[#122b6b]",
      headerFooterText: "text-white",
      headerFooterSubText: "text-blue-200/80",
      border: "border-slate-200/80",
      itemText: "text-slate-600",
      itemTextActive: "text-blue-600",
      itemActiveBg: "bg-white border-l-4 border-blue-600 rounded-r-xl shadow-xs shadow-slate-200 scale-[1.01]",
      itemHoverBg: "hover:bg-slate-200/50 hover:scale-[1.01]",
      iconBoxBg: "bg-slate-200/80 text-black",
      iconBoxActiveBg: "bg-blue-600 text-white shadow-md shadow-blue-500/20",
      btnBg: "bg-blue-600 shadow-md shadow-blue-500/20 border border-blue-400/20",
      btnHover: "hover:bg-blue-700 hover:shadow-lg",
      iconColor: "text-blue-600",
    };
  }, []);

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

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
            className="hidden md:flex absolute right-0 top-1/2 z-20 h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-blue-600 text-white shadow-xl transition-all hover:bg-blue-700 hover:scale-105"
            aria-label={collapsed ? "Mở rộng danh sách unit" : "Thu gọn danh sách unit"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <div className={`flex h-full w-full flex-col overflow-hidden border-r ${theme.border} ${theme.asideBg} shadow-xl transition-all duration-300`}>
            {collapsed ? (
              <div className={`flex h-full items-center justify-center ${theme.headerFooterBg}`}>
                <div className="rotate-90 whitespace-nowrap text-white font-extrabold tracking-wider text-xs">
                  UNIT
                </div>
              </div>
            ) : (
              <>
                <div className={`flex-shrink-0 flex items-center gap-3 px-4 py-4 ${theme.headerFooterBg}`}>
                  <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <BookOpen className={`w-5 h-5 ${theme.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-extrabold ${theme.headerFooterText} tracking-wide`}>
                      {resolvedBookName}
                    </div>
                    <div className={`text-[11px] font-medium ${theme.headerFooterSubText}`}>
                      Chọn Unit để chuyển nhanh
                    </div>
                  </div>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <X className={`w-5 h-5 ${theme.headerFooterText}`} />
                    </button>
                  )}
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-2">
                  {loading && !projects.length ? (
                    <div className={`px-3 py-2 text-xs text-gray-500`}>Đang tải dữ liệu...</div>
                  ) : projects.map((project, idx) => {
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
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                            active
                              ? theme.iconBoxActiveBg
                              : theme.iconBoxBg
                          }`}
                        >
                          {(idx + 1).toString().padStart(2, "0")}
                        </div>
                        <span
                          className={`text-[14px] line-clamp-2 ${
                            active ? "font-bold " + theme.itemTextActive : "font-bold " + theme.itemText
                          }`}
                        >
                          {project.name}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

