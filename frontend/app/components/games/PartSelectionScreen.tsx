"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { UnitGameConfig, UnitGamePart } from "@/types/games";
import { DEFAULT_ENABLED_GAMES } from "@/types/games";

type PartSelectionScreenProps = {
  unit: UnitGameConfig;
  heading: string;
  onSelectPart: (partId: string) => void;
  showBreadcrumb?: boolean;
  breadcrumbBackUrl?: string;
  breadcrumbBackLabel?: string;
};

export function PartSelectionScreen({
  unit,
  heading,
  onSelectPart,
  showBreadcrumb = false,
  breadcrumbBackUrl = "/resources/kids/Games",
  breadcrumbBackLabel = "Kids Book",
}: PartSelectionScreenProps) {
  const router = useRouter();
  const parts = unit.parts ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(408);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const CARD_W = cardWidth;
  const GAP = cardWidth < 408 ? 16 : 24; // responsive gap

  useEffect(() => {
    const updateCardWidth = () => {
      setCardWidth(window.innerWidth < 640 ? 288 : 408);
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const cardOffset = index * (CARD_W + GAP);
      const target = Math.max(0, cardOffset - (vp.clientWidth - CARD_W) / 2);
      vp.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" });
    },
    [CARD_W, GAP]
  );

  useEffect(() => {
    scrollToIndex(activeIndex, true);
  }, [activeIndex, scrollToIndex]);

  useEffect(() => {
    const handleResize = () => scrollToIndex(activeIndex, false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, scrollToIndex]);

  // Center inner content if it's narrower than viewport (remove trailing blank space)
  useEffect(() => {
    const vp = viewportRef.current;
    const inner = innerRef.current;
    if (!vp || !inner) return;
    const totalWidth = parts.length * (CARD_W + GAP) - GAP; // no gap after last
    if (totalWidth < vp.clientWidth) {
      const pad = Math.max(0, (vp.clientWidth - totalWidth) / 2);
      inner.style.paddingLeft = `${pad}px`;
      inner.style.paddingRight = `${pad}px`;
    } else {
      inner.style.paddingLeft = "";
      inner.style.paddingRight = "";
    }
  }, [parts.length, CARD_W, GAP]);

  // Nếu không có parts, không hiển thị gì
  if (parts.length === 0) {
    return null;
  }

  const getGameCount = (part: UnitGamePart) => {
    return part.enabledGames?.length ?? unit.enabledGames?.length ?? DEFAULT_ENABLED_GAMES.length;
  };

  // Palette nhẹ cho từng card (vòng lặp theo index)
  const colorPalette = [
    { card: "bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 border-sky-400 shadow-sky-400/50 text-white", icon: "bg-gradient-to-br from-sky-500 to-blue-600 text-white" },
    { card: "bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 border-indigo-400 shadow-indigo-400/50 text-white", icon: "bg-gradient-to-br from-indigo-500 to-violet-600 text-white" },
    { card: "bg-gradient-to-br from-green-400 via-emerald-500 to-lime-500 border-emerald-400 shadow-emerald-400/50 text-white", icon: "bg-gradient-to-br from-green-500 to-emerald-600 text-white" },
    { card: "bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 border-rose-400 shadow-rose-400/50 text-white", icon: "bg-gradient-to-br from-orange-400 to-rose-500 text-white" },
    { card: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 border-amber-400 shadow-amber-400/50 text-white", icon: "bg-gradient-to-br from-amber-500 to-orange-600 text-white" },
    { card: "bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600 border-pink-400 shadow-pink-400/50 text-white", icon: "bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white" },
  ];

  // Đặt nền đồng bộ giống trang Games
  const bgColor = "bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50";

  return (
    <div className={`min-h-screen ${bgColor} pb-20`}>
      {/* Breadcrumb Navigation */}
      {showBreadcrumb && (
        <div className="relative pt-2 pb-2 px-4 sm:px-6 min-h-[72px] flex justify-center items-start">
          <button
            onClick={() => router.back()}
            className="absolute left-4 sm:left-6 top-16 sm:top-20 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-300 hover:shadow-md transition-all font-semibold"
            style={{ zIndex: 50 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <nav className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-md hover:shadow-lg transition-all">
            <Link
              href={breadcrumbBackUrl}
              className="flex items-center gap-1.5 sm:gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors group"
            >
              <span className="text-base sm:text-lg">📚</span>
              <span className="text-sm sm:text-base">{breadcrumbBackLabel}</span>
            </Link>
            <span className="text-gray-300 text-lg sm:text-xl">→</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
              
              <span className="text-sm sm:text-base font-semibold">{heading}</span>
            </div>
          </nav>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 mt-20 sm:mt-24">
        <h1
          className="text-3xl sm:text-5xl font-bold mb-3 text-white drop-shadow-lg"
          style={{ textShadow: "0 12px 25px rgba(0,0,0,0.3)", color: "#0E4BA9" }}
        >
          {heading}
        </h1>
        <p className="text-2xl sm:text-3xl text-black font-medium">
          Choose topic to play game
        </p>
      </div>

      {/* Parts Row with carousel controls */}
      <div className="relative mx-auto mt-4 w-full max-w-[1272px] min-h-[440px] sm:h-[580px] flex items-center justify-center">
        <button
          type="button"
          onClick={() => setActiveIndex((i) => (i - 1 + parts.length) % parts.length)}
          className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/80 text-blue-700 shadow-lg backdrop-blur-md transition hover:bg-white hover:scale-105"
          aria-label="Qua card trước"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button
          type="button"
          onClick={() => setActiveIndex((i) => (i + 1) % parts.length)}
          className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/80 text-blue-700 shadow-lg backdrop-blur-md transition hover:bg-white hover:scale-105"
          aria-label="Qua card tiếp theo"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div className="overflow-hidden w-full" ref={viewportRef}>
          <div
            ref={innerRef}
            className="flex items-center gap-6 sm:gap-8"
          >
            {parts.map((part, index) => (
              <div key={part.id} className="flex-none mx-2">
                  {(() => {
                    const total = parts.length;
                    const gameCount = getGameCount(part);
                    const leftIndex = (activeIndex - 1 + total) % total;
                    const rightIndex = (activeIndex + 1) % total;
                    const isCenter = index === activeIndex;
                    const isSide = index === leftIndex || index === rightIndex;

                    const palette = colorPalette[index % colorPalette.length];
                    const cardClass = `group relative w-[min(86vw,${CARD_W}px)] h-[380px] sm:w-[408px] sm:h-[504px] rounded-[2rem] border ${palette.card} text-center cursor-pointer transition-[transform,opacity,filter,box-shadow] duration-500 ease-out will-change-transform ${
                      isCenter
                        ? "shadow-2xl ring-4 ring-white/70 scale-100"
                        : isSide
                        ? "shadow-xl opacity-90 scale-95"
                        : "opacity-50 scale-90 hidden sm:block"
                    }`;

                    return (
                      <div className={cardClass} onClick={() => setActiveIndex(index)} style={{ overflow: "hidden" }}>
                        <img src="/assets/choosetopic.png" alt="Choose topic" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-4 sm:px-6 py-5 sm:py-6">
                          <div
                            className={`font-extrabold transition-colors mb-1 ${isCenter ? "text-4xl sm:text-6xl" : "text-2xl sm:text-3xl"}`}
                            style={{
                              background: "linear-gradient(180deg,#00C2FF 0%,#FFFFFF 60%)",
                              WebkitBackgroundClip: "text",
                              backgroundClip: "text",
                              color: "transparent",
                              WebkitTextStroke: "1.6px #000000",
                              textShadow: "0 8px 14px rgba(8,56,98,0.38), 0 18px 40px rgba(0,0,0,0.28)",
                              fontWeight: 800
                            }}
                          >
                            {part.title}
                          </div>

                          <div
                            className={`font-bold max-w-[90%] ${isCenter ? "text-lg sm:text-2xl" : "text-base sm:text-lg"}`}
                            style={{
                              background: "linear-gradient(180deg,#00C2FF 0%,#FFFFFF 60%)",
                              WebkitBackgroundClip: "text",
                              backgroundClip: "text",
                              color: "transparent",
                              WebkitTextStroke: "1px #000000",
                              textShadow: "0 6px 10px rgba(8,56,98,0.28), 0 12px 28px rgba(0,0,0,0.2)",
                              fontWeight: 700
                            }}
                          >
                            {gameCount ? `${gameCount} games` : ""}
                          </div>

                          <div className="mt-4">
                            <button
                              onClick={() => onSelectPart(part.id)}
                              className="rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-wide border-white/30 text-slate-900 bg-white/70 shadow-md backdrop-blur-sm"
                            >
                              {isCenter ? "Play now" : isSide ? "Preview" : ""}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

