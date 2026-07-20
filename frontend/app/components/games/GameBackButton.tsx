"use client";

import { ChevronLeft } from "lucide-react";

type GameBackButtonProps = {
  onClick: () => void;
  className?: string;
};

export function GameBackButton({ onClick, className = "" }: GameBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/80 px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition-all hover:bg-white hover:shadow-md ${className}`}
    >
      <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={2.5} />
      <span>Back</span>
    </button>
  );
}
