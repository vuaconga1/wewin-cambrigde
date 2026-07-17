"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UnitGameConfig, UnitGamePart } from "@/types/games";
import { DEFAULT_ENABLED_GAMES } from "@/types/games";
import { GameMobileToolbar } from "@/app/components/games/GameMobileToolbar";

type PartSelectionScreenProps = {
  unit: UnitGameConfig;
  heading: string;
  onSelectPart: (partId: string) => void;
  showBreadcrumb?: boolean;
  breadcrumbBackUrl?: string;
  breadcrumbBackLabel?: string;
  onOpenUnitsSidebar?: () => void;
};

type StackSlot = {
  part: UnitGamePart;
  index: number;
  position: "left" | "center" | "right";
};

export function PartSelectionScreen({
  unit,
  heading,
  onSelectPart,
  showBreadcrumb = false,
  breadcrumbBackUrl = "/resources/kids/Games",
  breadcrumbBackLabel = "Kids Book",
  onOpenUnitsSidebar,
}: PartSelectionScreenProps) {
  const router = useRouter();
  const parts = unit.parts ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [cardSize, setCardSize] = useState({ width: 408, height: 504 });

  useEffect(() => {
    const updateCardSize = () => {
      const w = window.innerWidth;
      if (w >= 768) {
        setCardSize({ width: 408, height: 504 });
      } else if (w < 400) {
        setCardSize({ width: 220, height: 280 });
      } else if (w < 640) {
        setCardSize({ width: 260, height: 330 });
      } else {
        setCardSize({ width: 320, height: 400 });
      }
    };

    updateCardSize();
    window.addEventListener("resize", updateCardSize);
    return () => window.removeEventListener("resize", updateCardSize);
  }, []);

  useEffect(() => {
    if (activeIndex >= parts.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, parts.length]);

  const getGameCount = (part: UnitGamePart) => {
    return part.enabledGames?.length ?? unit.enabledGames?.length ?? DEFAULT_ENABLED_GAMES.length;
  };

  const moveCard = useCallback(
    (direction: -1 | 1) => {
      if (!parts.length) return;
      setActiveIndex((current) => (current + direction + parts.length) % parts.length);
    },
    [parts.length],
  );

  const selectCard = useCallback(
    (index: number, position: StackSlot["position"]) => {
      if (position === "center") {
        onSelectPart(parts[index].id);
        return;
      }
      setActiveIndex(index);
    },
    [onSelectPart, parts],
  );

  const stackedCards = useMemo<StackSlot[]>(() => {
    const total = parts.length;
    if (total === 0) return [];

    if (total === 1) {
      return [{ part: parts[0], index: 0, position: "center" }];
    }

    const leftIndex = (activeIndex - 1 + total) % total;
    const rightIndex = (activeIndex + 1) % total;

    return [
      { part: parts[leftIndex], index: leftIndex, position: "left" },
      { part: parts[activeIndex], index: activeIndex, position: "center" },
      { part: parts[rightIndex], index: rightIndex, position: "right" },
    ];
  }, [activeIndex, parts]);

  if (parts.length === 0) {
    return null;
  }

  const isDesktop = cardSize.width >= 408;
  const carouselHeight = isDesktop ? 580 : cardSize.height + 40;

  const renderStackedCard = (slot: StackSlot) => {
    const isCenter = slot.position === "center";
    const isSide = slot.position === "left" || slot.position === "right";
    const hideOnMobile = isSide && !isDesktop;

    const positionStyles =
      slot.position === "left"
        ? {
            left: "50%",
            top: "50%",
            transform: isDesktop
              ? "translate(-122%, -50%) scale(0.82) rotate(-6deg)"
              : "translate(-118%, -50%) scale(0.78) rotate(-6deg)",
            zIndex: 10,
            opacity: 0.72,
          }
        : slot.position === "right"
          ? {
              left: "50%",
              top: "50%",
              transform: isDesktop
                ? "translate(22%, -50%) scale(0.82) rotate(6deg)"
                : "translate(18%, -50%) scale(0.78) rotate(6deg)",
              zIndex: 10,
              opacity: 0.72,
            }
          : {
              left: "50%",
              top: "50%",
              transform: isDesktop
                ? "translate(-50%, -50%) scale(1.01)"
                : "translate(-50%, -50%) scale(1)",
              zIndex: 30,
              opacity: 1,
            };

    if (hideOnMobile) return null;

    const gameCount = getGameCount(slot.part);

    return (
      <button
        key={`${slot.position}-${slot.part.id}`}
        type="button"
        onClick={() => selectCard(slot.index, slot.position)}
        className={`group absolute overflow-hidden rounded-2xl md:rounded-[2rem] border text-center cursor-pointer transition-[transform,opacity,filter,box-shadow] duration-500 ease-out will-change-transform hover:scale-[1.02] ${
          isCenter
            ? "shadow-2xl ring-4 ring-white/70"
            : "shadow-xl hover:shadow-2xl"
        }`}
        style={{ width: cardSize.width, height: cardSize.height, ...positionStyles }}
      >
        <img
          src="/assets/choosetopic.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-5 sm:px-8">
          <div
            className={`w-full font-extrabold leading-tight break-words line-clamp-3 ${
              isCenter ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg sm:text-2xl"
            }`}
            style={{
              background: "linear-gradient(180deg,#00C2FF 0%,#FFFFFF 60%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextStroke: "1.2px #000000",
              textShadow: "0 8px 14px rgba(8,56,98,0.38), 0 18px 40px rgba(0,0,0,0.28)",
            }}
          >
            {slot.part.title}
          </div>

          <div
            className={`mt-1 font-bold ${isCenter ? "text-sm sm:text-lg md:text-xl" : "text-xs sm:text-base"}`}
            style={{
              background: "linear-gradient(180deg,#00C2FF 0%,#FFFFFF 60%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextStroke: "1px #000000",
              textShadow: "0 6px 10px rgba(8,56,98,0.28), 0 12px 28px rgba(0,0,0,0.2)",
            }}
          >
            {gameCount ? `${gameCount} games` : ""}
          </div>

          <div className="mt-4 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide border-white/40 bg-white/75 text-slate-900 shadow-md backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-sm">
            {isCenter ? "Play now" : slot.position === "left" ? "Preview" : "Next"}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <GameMobileToolbar
        onBack={() => router.back()}
        onOpenUnits={onOpenUnitsSidebar}
        title={heading}
        subtitle="Chọn topic"
      />

      {showBreadcrumb && (
        <div className="hidden md:flex relative pt-2 pb-2 px-6 min-h-[52px] items-center justify-center">
          <button
            onClick={() => router.back()}
            className="absolute left-6 top-2 inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white text-slate-700 border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <span>Back</span>
          </button>

          <nav className="inline-flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-md">
            <Link
              href={breadcrumbBackUrl}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <span className="text-lg">📚</span>
              <span>{breadcrumbBackLabel}</span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="flex items-center gap-2 text-blue-900 font-semibold">
              <span className="text-lg">📖</span>
              <span>{heading}</span>
            </span>
          </nav>
        </div>
      )}

      <div className="text-center mb-4 sm:mb-8 mt-3 md:mt-6 px-3">
        <h1
          className="hidden md:block text-3xl sm:text-5xl font-bold mb-3 drop-shadow-lg"
          style={{ textShadow: "0 12px 25px rgba(0,0,0,0.3)", color: "#0E4BA9" }}
        >
          {heading}
        </h1>
        <p className="text-base sm:text-2xl md:text-3xl text-black font-medium">
          Choose topic to play game
        </p>
      </div>

      <div
        className={`relative mx-auto mt-2 md:mt-4 w-full max-w-6xl px-3 sm:px-4 md:px-6 ${isDesktop ? "h-[460px] sm:h-[540px] md:h-[580px]" : ""}`}
        style={isDesktop ? undefined : { height: carouselHeight }}
      >
        {parts.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => moveCard(-1)}
              className="absolute -left-2 md:left-0 lg:left-2 top-1/2 -translate-y-1/2 z-40 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/40 bg-white/90 text-blue-700 shadow-lg backdrop-blur-md transition hover:bg-white hover:scale-105"
              aria-label="Qua card trước"
            >
              <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              type="button"
              onClick={() => moveCard(1)}
              className="absolute -right-2 md:right-0 lg:right-2 top-1/2 -translate-y-1/2 z-40 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/40 bg-white/90 text-blue-700 shadow-lg backdrop-blur-md transition hover:bg-white hover:scale-105"
              aria-label="Qua card tiếp theo"
            >
              <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}

        <div className="relative h-full w-full overflow-hidden">
          {stackedCards.map((slot) => renderStackedCard(slot))}
        </div>
      </div>

      {parts.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 px-4">
          {parts.map((part, index) => (
            <button
              key={part.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-6 bg-blue-600" : "w-2 bg-blue-300 hover:bg-blue-400"
              }`}
              aria-label={`Chọn ${part.title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
