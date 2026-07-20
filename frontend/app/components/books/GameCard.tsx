"use client";

import React from "react";
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

const GameCard: React.FC<GameCardProps> = ({ book }) => {
  const level = resolveLevelKey(book.id);
  const imageSrc = LEVEL_IMAGE[level];

  return (
    <Link
      href={book.gameUrl || "#"}
      aria-label={book.name}
      className="group relative mx-auto block w-full max-w-[420px] transition-all duration-500 ease-out hover:-translate-y-2 xl:max-w-[480px] 2xl:max-w-none"
    >
      <img
        src={`${imageSrc}?v=10`}
        alt={book.name}
        className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
        style={{
          filter:
            "drop-shadow(0 0 1px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.75)) drop-shadow(0 14px 28px rgba(15,23,42,0.28))",
        }}
      />
    </Link>
  );
};

export default GameCard;
