"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Volume2, VolumeX } from "lucide-react";

import { useBackgroundMusic } from "./BackgroundMusicProvider";
import { BGM_TRACKS } from "./constants";
import {
  readSfxSettings,
  SFX_DEFAULT_SETTINGS,
  subscribeSfxSettings,
  writeSfxSettings,
} from "./sfxSettings";
import {
  readVoiceSettings,
  subscribeVoiceSettings,
  VOICE_DEFAULT_SETTINGS,
  writeVoiceSettings,
} from "./voiceSettings";

type Props = {
  compact?: boolean;
};

function useSfxSettings() {
  return useSyncExternalStore(
    subscribeSfxSettings,
    readSfxSettings,
    () => SFX_DEFAULT_SETTINGS,
  );
}

function useVoiceSettings() {
  return useSyncExternalStore(
    subscribeVoiceSettings,
    readVoiceSettings,
    () => VOICE_DEFAULT_SETTINGS,
  );
}

function VolumeRow({
  label,
  volumePercent,
  effectiveMuted,
  accentClass,
  onVolumeChange,
  onToggleMute,
  ariaPrefix,
  children,
}: {
  label: string;
  volumePercent: number;
  effectiveMuted: boolean;
  accentClass: string;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  ariaPrefix: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-slate-700">{label}</p>
      {children}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volumePercent}
          aria-label={`${ariaPrefix} — âm lượng`}
          onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
          className={`h-1.5 min-w-0 flex-1 cursor-pointer ${accentClass}`}
        />
        <span className="w-7 shrink-0 text-center text-xs font-semibold text-slate-600">
          {volumePercent}
        </span>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={effectiveMuted ? `Bật ${ariaPrefix}` : `Tắt ${ariaPrefix}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
        >
          {effectiveMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function AudioControlsPanel() {
  const {
    volume: bgmVolume,
    muted: bgmMuted,
    trackId,
    setVolume: setBgmVolume,
    setTrack,
    toggleMute: toggleBgmMute,
  } = useBackgroundMusic();

  const sfxSettings = useSfxSettings();
  const voiceSettings = useVoiceSettings();

  const bgmEffectiveMuted = bgmMuted || bgmVolume === 0;
  const bgmVolumePercent = Math.round(bgmVolume * 100);
  const sfxEffectiveMuted = sfxSettings.muted || sfxSettings.volume === 0;
  const sfxVolumePercent = Math.round(sfxSettings.volume * 100);
  const voiceEffectiveMuted = voiceSettings.muted || voiceSettings.volume === 0;
  const voiceVolumePercent = Math.round(voiceSettings.volume * 100);

  const setSfxVolume = useCallback((volume: number) => {
    const clamped = Math.min(1, Math.max(0, volume));
    writeSfxSettings({ volume: clamped, muted: clamped === 0 });
  }, []);

  const toggleSfxMute = useCallback(() => {
    const prev = readSfxSettings();
    const nextMuted = !prev.muted;
    writeSfxSettings(
      nextMuted || prev.volume > 0
        ? { ...prev, muted: nextMuted }
        : { muted: false, volume: SFX_DEFAULT_SETTINGS.volume },
    );
  }, []);

  const setVoiceVolume = useCallback((volume: number) => {
    const clamped = Math.min(1, Math.max(0, volume));
    writeVoiceSettings({ volume: clamped, muted: clamped === 0 });
  }, []);

  const toggleVoiceMute = useCallback(() => {
    const prev = readVoiceSettings();
    const nextMuted = !prev.muted;
    writeVoiceSettings(
      nextMuted || prev.volume > 0
        ? { ...prev, muted: nextMuted }
        : { muted: false, volume: VOICE_DEFAULT_SETTINGS.volume },
    );
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <VolumeRow
        label="Nhạc nền"
        volumePercent={bgmVolumePercent}
        effectiveMuted={bgmEffectiveMuted}
        accentClass="accent-[#0E4BA9]"
        onVolumeChange={setBgmVolume}
        onToggleMute={toggleBgmMute}
        ariaPrefix="nhạc nền"
      >
        <select
          value={trackId}
          aria-label="Chọn bài nhạc nền"
          onChange={(event) =>
            setTrack(event.target.value as (typeof BGM_TRACKS)[number]["id"])
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#0E4BA9] focus:ring-2 focus:ring-[#0E4BA9]/20"
        >
          {BGM_TRACKS.map((track) => (
            <option key={track.id} value={track.id}>
              {track.label}
            </option>
          ))}
        </select>
      </VolumeRow>

      <div className="h-px bg-slate-200" />

      <VolumeRow
        label="Hiệu ứng"
        volumePercent={sfxVolumePercent}
        effectiveMuted={sfxEffectiveMuted}
        accentClass="accent-emerald-600"
        onVolumeChange={setSfxVolume}
        onToggleMute={toggleSfxMute}
        ariaPrefix="hiệu ứng"
      />

      <div className="h-px bg-slate-200" />

      <VolumeRow
        label="Lời động viên"
        volumePercent={voiceVolumePercent}
        effectiveMuted={voiceEffectiveMuted}
        accentClass="accent-amber-500"
        onVolumeChange={setVoiceVolume}
        onToggleMute={toggleVoiceMute}
        ariaPrefix="lời động viên"
      />
    </div>
  );
}

export function AudioControls({ compact = true }: Props) {
  const { needsInteraction, muted, volume } = useBackgroundMusic();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const sfxSettings = useSfxSettings();
  const voiceSettings = useVoiceSettings();

  const allMuted =
    (muted || volume === 0) &&
    (sfxSettings.muted || sfxSettings.volume === 0) &&
    (voiceSettings.muted || voiceSettings.volume === 0);

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
      <div className="w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-white/50 bg-white/75 p-3 shadow-md backdrop-blur-md sm:p-4">
        <AudioControlsPanel />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Cài đặt âm thanh"
        title={
          needsInteraction
            ? "Nhấn để phát nhạc / chỉnh âm lượng"
            : allMuted
              ? "Bật / chỉnh âm thanh"
              : "Chỉnh âm thanh"
        }
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/80 text-[#0E4BA9] shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105 sm:h-10 sm:w-10"
      >
        {allMuted ? (
          <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-40 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-white/60 bg-white/95 p-3 shadow-xl backdrop-blur-md sm:p-4">
          <AudioControlsPanel />
        </div>
      ) : null}
    </div>
  );
}
