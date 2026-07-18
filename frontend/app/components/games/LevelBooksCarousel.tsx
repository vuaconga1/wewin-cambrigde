"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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

const IMAGE_VERSION = "5";

type StackSlot = {
  book: Book;
  index: number;
  position: "left" | "center" | "right";
};

type Props = {
  books: Book[];
};

export function LevelBooksCarousel({ books }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardSize, setCardSize] = useState({ width: 260, height: 347 });
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const updateCardSize = () => {
      const w = window.innerWidth;
      if (w >= 768) {
        setCardSize({ width: 320, height: 427 });
      } else if (w < 400) {
        setCardSize({ width: 220, height: 293 });
      } else if (w < 640) {
        setCardSize({ width: 260, height: 347 });
      } else {
        setCardSize({ width: 300, height: 400 });
      }
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

  const showSidePeeks = cardSize.width >= 300;
  const carouselHeight = cardSize.height + 48;

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
    const isSide = slot.position === "left" || slot.position === "right";
    if (isSide && !showSidePeeks) return null;

    const level = resolveLevelKey(slot.book.id);
    const imageSrc = LEVEL_IMAGE[level];

    const positionStyles =
      slot.position === "left"
        ? {
            left: "50%",
            top: "50%",
            transform: "translate(-118%, -50%) scale(0.78) rotate(-6deg)",
            zIndex: 10,
            opacity: 0.72,
          }
        : slot.position === "right"
          ? {
              left: "50%",
              top: "50%",
              transform: "translate(18%, -50%) scale(0.78) rotate(6deg)",
              zIndex: 10,
              opacity: 0.72,
            }
          : {
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) scale(1)",
              zIndex: 30,
              opacity: 1,
            };

    const handleClick = () => {
      if (!isCenter) {
        setActiveIndex(slot.index);
      }
    };

    const body = (
      <img
        src={`${imageSrc}?v=${IMAGE_VERSION}`}
        alt={slot.book.name}
        className="h-full w-full object-contain drop-shadow-[0_16px_36px_rgba(15,23,42,0.28)]"
        draggable={false}
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
        onClick={handleClick}
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
    <div className="w-full lg:hidden">
      <div
        className="relative mx-auto w-full max-w-3xl touch-pan-y"
        style={{ height: carouselHeight }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {books.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => moveCard(-1)}
              className="absolute -left-1 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-blue-700 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white sm:left-0 sm:h-11 sm:w-11"
              aria-label="Thẻ trước"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => moveCard(1)}
              className="absolute -right-1 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-blue-700 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white sm:right-0 sm:h-11 sm:w-11"
              aria-label="Thẻ tiếp theo"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        <div className="relative h-full w-full overflow-hidden">
          {stackedCards.map(renderCard)}
        </div>
      </div>

      {books.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 px-4">
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
