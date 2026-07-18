"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { useBackgroundMusic } from "./useBackgroundMusic";

type Props = {
  /** Chỉ hiện nút; bấm mới xổ slider */
  compact?: boolean;
};

export function BackgroundMusicControls({ compact = false }: Props) {
  const { volume, muted, isPlaying, needsInteraction, setVolume, toggleMute } =
    useBackgroundMusic();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const effectiveMuted = muted || volume === 0;
  const volumePercent = Math.round(volume * 100);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  if (!compact) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-white/50 bg-white/75 px-1.5 py-1 shadow-md backdrop-blur-md sm:gap-2 sm:px-2 sm:py-1.5">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volumePercent}
          aria-label="Âm lượng nhạc nền"
          onChange={(event) => setVolume(Number(event.target.value) / 100)}
          className="h-1.5 w-12 cursor-pointer accent-[#0E4BA9] sm:w-20 md:w-24"
        />
        <span className="hidden w-8 text-center text-xs font-semibold text-slate-600 sm:inline">
          {volumePercent}
        </span>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={effectiveMuted ? "Bật nhạc nền" : "Tắt nhạc nền"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#0E4BA9] transition hover:bg-white hover:shadow-sm sm:h-9 sm:w-9"
        >
          {effectiveMuted ? (
            <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Âm lượng nhạc nền"
        title={
          needsInteraction
            ? "Nhấn để phát nhạc"
            : effectiveMuted
              ? "Bật / chỉnh âm lượng"
              : isPlaying
                ? "Chỉnh âm lượng"
                : "Chỉnh âm lượng"
        }
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/80 text-[#0E4BA9] shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105 sm:h-10 sm:w-10"
      >
        {effectiveMuted ? (
          <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-40 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={volumePercent}
            aria-label="Âm lượng nhạc nền"
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            className="h-1.5 w-24 cursor-pointer accent-[#0E4BA9] sm:w-28"
          />
          <span className="w-7 text-center text-xs font-semibold text-slate-600">
            {volumePercent}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={effectiveMuted ? "Bật nhạc nền" : "Tắt nhạc nền"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0E4BA9] transition hover:bg-slate-100"
          >
            {effectiveMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
