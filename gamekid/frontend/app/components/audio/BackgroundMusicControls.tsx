"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";

import { BGM_TRACKS } from "./constants";
import { useBackgroundMusic } from "./BackgroundMusicProvider";

type Props = {
  /** Chỉ hiện nút; bấm mới xổ slider */
  compact?: boolean;
};

function TrackSelector({
  trackId,
  onChange,
  className = "",
}: {
  trackId: string;
  onChange: (trackId: (typeof BGM_TRACKS)[number]["id"]) => void;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Nhạc nền
      </span>
      <select
        value={trackId}
        aria-label="Chọn nhạc nền"
        onChange={(event) =>
          onChange(event.target.value as (typeof BGM_TRACKS)[number]["id"])
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#0E4BA9] focus:ring-2 focus:ring-[#0E4BA9]/20"
      >
        {BGM_TRACKS.map((track) => (
          <option key={track.id} value={track.id}>
            {track.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function VolumeControls({
  volumePercent,
  effectiveMuted,
  onVolumeChange,
  onToggleMute,
}: {
  volumePercent: number;
  effectiveMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}) {
  return (
    <>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={volumePercent}
        aria-label="Âm lượng nhạc nền"
        onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
        className="h-1.5 w-24 cursor-pointer accent-[#0E4BA9] sm:w-28"
      />
      <span className="w-7 text-center text-xs font-semibold text-slate-600">
        {volumePercent}
      </span>
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={effectiveMuted ? "Bật nhạc nền" : "Tắt nhạc nền"}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0E4BA9] transition hover:bg-slate-100"
      >
        {effectiveMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>
    </>
  );
}

export function BackgroundMusicControls({ compact = false }: Props) {
  const {
    volume,
    muted,
    trackId,
    isPlaying,
    needsInteraction,
    setVolume,
    setTrack,
    toggleMute,
  } = useBackgroundMusic();
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
      <div className="flex flex-col gap-2 rounded-2xl border border-white/50 bg-white/75 px-2 py-2 shadow-md backdrop-blur-md sm:px-3 sm:py-2.5">
        <TrackSelector trackId={trackId} onChange={setTrack} className="min-w-[10rem]" />
        <div className="flex items-center gap-1 sm:gap-2">
          <VolumeControls
            volumePercent={volumePercent}
            effectiveMuted={effectiveMuted}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Nhạc nền"
        title={
          needsInteraction
            ? "Nhấn để phát nhạc"
            : effectiveMuted
              ? "Bật / chọn nhạc nền"
              : isPlaying
                ? "Chọn nhạc nền"
                : "Chọn nhạc nền"
        }
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/80 text-[#0E4BA9] shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105 sm:h-10 sm:w-10"
      >
        {effectiveMuted ? (
          <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Music className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-40 w-[min(16rem,calc(100vw-1.5rem))] rounded-2xl border border-white/60 bg-white/95 p-3 shadow-xl backdrop-blur-md">
          <TrackSelector trackId={trackId} onChange={setTrack} />
          <div className="mt-3 flex items-center gap-2">
            <VolumeControls
              volumePercent={volumePercent}
              effectiveMuted={effectiveMuted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
