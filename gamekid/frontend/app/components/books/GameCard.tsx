"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Book } from "../../../lib/constants/types";
import { resolveLevelKey } from "@/app/components/games/forest-background/levelCardThemes";

interface GameCardProps {
  book: Book;
}

const LEVEL_IMAGE: Record<string, string> = {
  kids: "/assets/levels/kids.png",
  starters: "/assets/levels/starters.png",
  movers: "/assets/levels/movers.png",
  flyers: "/assets/levels/flyers.png",
};

function topicCardSize(viewportWidth: number, viewportHeight: number) {
  if (viewportWidth >= 768) {
    const height = Math.min(Math.floor(viewportHeight * 0.55), 504);
    const width = Math.min(408, Math.round(height * 0.81));
    return { width, height: Math.round(width / 0.81) };
  }
  if (viewportWidth < 400) {
    const width = Math.min(240, Math.floor(viewportWidth * 0.66));
    return { width, height: Math.round(width * 1.27) };
  }
  if (viewportWidth < 640) {
    const width = Math.min(280, Math.floor(viewportWidth * 0.66));
    return { width, height: Math.round(width * 1.27) };
  }
  const width = Math.min(320, Math.floor(viewportWidth * 0.5));
  return { width, height: Math.round(width * 1.25) };
}

const GameCard: React.FC<GameCardProps> = ({ book }) => {
  const level = resolveLevelKey(book.id);
  const imageSrc = LEVEL_IMAGE[level];
  const [cardSize, setCardSize] = useState({ width: 401, height: 495 });

  useEffect(() => {
    const updateCardSize = () => {
      setCardSize(topicCardSize(window.innerWidth, window.innerHeight));
    };
    updateCardSize();
    window.addEventListener("resize", updateCardSize);
    return () => window.removeEventListener("resize", updateCardSize);
  }, []);

  return (
    <Link
      href={book.gameUrl || "#"}
      aria-label={book.name}
      className="group relative mx-auto block transition-all duration-500 ease-out hover:-translate-y-2"
      style={{ width: cardSize.width, height: cardSize.height }}
    >
      <img
        src={`${imageSrc}?v=11`}
        alt={book.name}
        className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
        style={{
          filter:
            "drop-shadow(0 0 1px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.75)) drop-shadow(0 14px 28px rgba(15,23,42,0.28))",
        }}
      />
    </Link>
  );
};

export default GameCard;
