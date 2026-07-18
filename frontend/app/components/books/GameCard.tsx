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
      className="group relative block aspect-[3/4] transition-all duration-500 ease-out hover:-translate-y-2"
    >
      <img
        src={`${imageSrc}?v=5`}
        alt={book.name}
        className="h-full w-full object-contain drop-shadow-[0_16px_36px_rgba(15,23,42,0.28)] transition-transform duration-700 group-hover:scale-[1.03]"
      />
    </Link>
  );
};

export default GameCard;
