"use client";

import { Volume2, VolumeX } from "lucide-react";

import { useBackgroundMusic } from "./useBackgroundMusic";

export function BackgroundMusicControls() {
  const { volume, muted, isPlaying, needsInteraction, setVolume, toggleMute } =
    useBackgroundMusic();

  const effectiveMuted = muted || volume === 0;
  const volumePercent = Math.round(volume * 100);

  return (
    <div className="fixed z-30 bottom-4 right-3 md:bottom-6 md:right-6">
      <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/75 px-2 py-1.5 shadow-md backdrop-blur-md">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volumePercent}
          aria-label="Âm lượng nhạc nền"
          onChange={(event) => setVolume(Number(event.target.value) / 100)}
          className="h-1.5 w-16 cursor-pointer accent-[#0E4BA9] sm:w-20 md:w-24"
        />
        <span className="hidden w-8 text-center text-xs font-semibold text-slate-600 sm:inline">
          {volumePercent}
        </span>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={effectiveMuted ? "Bật nhạc nền" : "Tắt nhạc nền"}
          title={
            needsInteraction
              ? "Nhấn để phát nhạc"
              : effectiveMuted
                ? "Bật nhạc nền"
                : isPlaying
                  ? "Tắt nhạc nền"
                  : "Bật nhạc nền"
          }
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0E4BA9] transition hover:bg-white hover:shadow-sm"
        >
          {effectiveMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
