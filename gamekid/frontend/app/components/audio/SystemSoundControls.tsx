"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import {
  readSfxSettings,
  SFX_DEFAULT_SETTINGS,
  subscribeSfxSettings,
  writeSfxSettings,
} from "./sfxSettings";

type Props = {
  compact?: boolean;
};

function SfxVolumePanel({
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
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
        Âm tương tác
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={volumePercent}
        aria-label="Âm lượng hiệu ứng tương tác"
        onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
        className="h-1.5 w-24 cursor-pointer accent-emerald-600 sm:w-28"
      />
      <span className="w-7 text-center text-xs font-semibold text-slate-600">
        {volumePercent}
      </span>
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={effectiveMuted ? "Bật âm tương tác" : "Tắt âm tương tác"}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-700 transition hover:bg-slate-100"
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

export function SystemSoundControls({ compact = false }: Props) {
  const [settings, setSettings] = useState(SFX_DEFAULT_SETTINGS);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(readSfxSettings());
    return subscribeSfxSettings(() => setSettings(readSfxSettings()));
  }, []);

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

  const effectiveMuted = settings.muted || settings.volume === 0;
  const volumePercent = Math.round(settings.volume * 100);

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.min(1, Math.max(0, volume));
    const next = { volume: clamped, muted: clamped === 0 };
    writeSfxSettings(next);
    setSettings(next);
  }, []);

  const toggleMute = useCallback(() => {
    setSettings((prev) => {
      const nextMuted = !prev.muted;
      const next =
        nextMuted || prev.volume > 0
          ? { ...prev, muted: nextMuted }
          : { ...prev, muted: false, volume: SFX_DEFAULT_SETTINGS.volume };
      writeSfxSettings(next);
      return next;
    });
  }, []);

  if (!compact) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/75 px-3 py-2 shadow-md backdrop-blur-md">
        <SfxVolumePanel
          volumePercent={volumePercent}
          effectiveMuted={effectiveMuted}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
        />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Âm lượng tương tác"
        title={effectiveMuted ? "Bật / chỉnh âm tương tác" : "Chỉnh âm tương tác"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/80 text-emerald-700 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105 sm:h-10 sm:w-10"
      >
        {effectiveMuted ? (
          <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-40 flex w-[min(18rem,calc(100vw-1.5rem))] flex-wrap items-center gap-2 rounded-2xl border border-white/60 bg-white/95 p-3 shadow-xl backdrop-blur-md">
          <SfxVolumePanel
            volumePercent={volumePercent}
            effectiveMuted={effectiveMuted}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />
        </div>
      ) : null}
    </div>
  );
}
