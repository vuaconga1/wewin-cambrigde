"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from "react";
import type { Book } from "@/lib/constants/types";
import { resolveLevelKey } from "@/app/components/games/forest-background/levelCardThemes";

const LEVEL_IMAGE: Record<string, string> = {
  kids: "/assets/levels/kids.png",
  starters: "/assets/levels/starters.png",
  movers: "/assets/levels/movers.png",
  flyers: "/assets/levels/flyers.png",
};

const IMAGE_VERSION = "11";

type StackSlot = {
  book: Book;
  index: number;
  position: "left" | "center" | "right";
};

type Props = {
  books: Book[];
};

function peekTransform(
  position: "left" | "center" | "right",
  wide: boolean,
): CSSProperties {
  if (position === "left") {
    return {
      left: "50%",
      top: "50%",
      transform: wide
        ? "translate(-112%, -50%) scale(0.84) rotate(-5deg)"
        : "translate(-102%, -50%) scale(0.86) rotate(-4deg)",
      zIndex: 10,
      opacity: 0.78,
    };
  }
  if (position === "right") {
    return {
      left: "50%",
      top: "50%",
      transform: wide
        ? "translate(12%, -50%) scale(0.84) rotate(5deg)"
        : "translate(2%, -50%) scale(0.86) rotate(4deg)",
      zIndex: 10,
      opacity: 0.78,
    };
  }
  return {
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%) scale(1)",
    zIndex: 30,
    opacity: 1,
  };
}

export function LevelBooksCarousel({ books }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardSize, setCardSize] = useState({ width: 300, height: 375 });
  const [wide, setWide] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const updateCardSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isWide = w >= 768;
      setWide(isWide);
      // Center card ~72% viewport so art reads large; peeks still visible
      const byW = Math.floor(w * (isWide ? 0.34 : 0.72));
      const byH = Math.floor(h * (isWide ? 0.68 : 0.62));
      const height = Math.min(byH, isWide ? 560 : 480);
      const width = Math.min(byW, Math.round(height * 0.84), isWide ? 440 : 360);
      setCardSize({
        width: Math.max(240, width),
        height: Math.max(300, Math.round(Math.max(240, width) / 0.84)),
      });
    };

    updateCardSize();
    window.addEventListener("resize", updateCardSize);
    return () => window.removeEventListener("resize", updateCardSize);
  }, []);

  useEffect(() => {
    if (activeIndex >= books.length) setActiveIndex(0);
  }, [activeIndex, books.length]);

  const moveCard = useCallback(
    (direction: -1 | 1) => {
      if (!books.length) return;
      setActiveIndex((current) => (current + direction + books.length) % books.length);
    },
    [books.length],
  );

  const stackedCards = useMemo<StackSlot[]>(() => {
    const total = books.length;
    if (total === 0) return [];
    if (total === 1) {
      return [{ book: books[0], index: 0, position: "center" }];
    }

    const leftIndex = (activeIndex - 1 + total) % total;
    const rightIndex = (activeIndex + 1) % total;

    return [
      { book: books[leftIndex], index: leftIndex, position: "left" },
      { book: books[activeIndex], index: activeIndex, position: "center" },
      { book: books[rightIndex], index: rightIndex, position: "right" },
    ];
  }, [activeIndex, books]);

  const carouselHeight = cardSize.height + (wide ? 56 : 40);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    moveCard(delta < 0 ? 1 : -1);
  };

  const renderCard = (slot: StackSlot) => {
    const isCenter = slot.position === "center";
    const level = resolveLevelKey(slot.book.id);
    const imageSrc = LEVEL_IMAGE[level];
    const positionStyles = peekTransform(slot.position, wide);

    const body = (
      <img
        src={`${imageSrc}?v=${IMAGE_VERSION}`}
        alt={slot.book.name}
        className="h-full w-full object-contain"
        draggable={false}
        style={{
          filter: isCenter
            ? "drop-shadow(0 0 1px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.75)) drop-shadow(0 14px 28px rgba(15,23,42,0.28))"
            : "drop-shadow(0 0 1px rgba(255,255,255,0.7)) drop-shadow(0 0 3px rgba(255,255,255,0.5)) drop-shadow(0 10px 20px rgba(15,23,42,0.22))",
        }}
      />
    );

    if (isCenter) {
      return (
        <Link
          key={`${slot.position}-${slot.book.id}`}
          href={slot.book.gameUrl || "#"}
          aria-label={slot.book.name}
          className="absolute transition-[transform,opacity] duration-500 ease-out will-change-transform"
          style={{ width: cardSize.width, height: cardSize.height, ...positionStyles }}
        >
          {body}
        </Link>
      );
    }

    return (
      <button
        key={`${slot.position}-${slot.book.id}`}
        type="button"
        onClick={() => setActiveIndex(slot.index)}
        aria-label={`Xem ${slot.book.name}`}
        className="absolute cursor-pointer transition-[transform,opacity] duration-500 ease-out will-change-transform"
        style={{ width: cardSize.width, height: cardSize.height, ...positionStyles }}
      >
        {body}
      </button>
    );
  };

  if (!books.length) return null;

  return (
    <div className="w-full">
      <div
        className="relative mx-auto w-full max-w-5xl touch-pan-y px-2"
        style={{ height: carouselHeight }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {books.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => moveCard(-1)}
              className="absolute left-0 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-blue-700 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white sm:h-11 sm:w-11 md:left-2"
              aria-label="Thẻ trước"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => moveCard(1)}
              className="absolute right-0 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-blue-700 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white sm:h-11 sm:w-11 md:right-2"
              aria-label="Thẻ tiếp theo"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        <div className="relative h-full w-full overflow-visible">
          {stackedCards.map(renderCard)}
        </div>
      </div>

      {books.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2 px-4 sm:mt-4">
          {books.map((book, index) => (
            <button
              key={book.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-6 bg-blue-600" : "w-2 bg-blue-300 hover:bg-blue-400"
              }`}
              aria-label={`Chọn ${book.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
