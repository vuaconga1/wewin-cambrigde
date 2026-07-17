"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  BGM_DEFAULT_SETTINGS,
  BGM_SRC,
  BGM_STORAGE_KEY,
  type BgmSettings,
} from "./constants";

let sharedAudio: HTMLAudioElement | null = null;
let autoplayBound = false;

function getSharedAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio(BGM_SRC);
    sharedAudio.loop = true;
    sharedAudio.preload = "auto";
  }
  return sharedAudio;
}

function readStoredSettings(): BgmSettings {
  if (typeof window === "undefined") return BGM_DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(BGM_STORAGE_KEY);
    if (!raw) return BGM_DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<BgmSettings>;
    const volume =
      typeof parsed.volume === "number"
        ? Math.min(1, Math.max(0, parsed.volume))
        : BGM_DEFAULT_SETTINGS.volume;
    const muted =
      typeof parsed.muted === "boolean"
        ? parsed.muted
        : BGM_DEFAULT_SETTINGS.muted;
    return { volume, muted };
  } catch {
    return BGM_DEFAULT_SETTINGS;
  }
}

function writeStoredSettings(settings: BgmSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BGM_STORAGE_KEY, JSON.stringify(settings));
}

function bindAutoplayUnlock(audio: HTMLAudioElement, onPlay: () => void) {
  if (autoplayBound) return;
  autoplayBound = true;

  const tryPlay = () => {
    if (audio.muted) return;
    void audio.play().then(onPlay).catch(() => {});
  };

  const unlock = () => {
    tryPlay();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export function useBackgroundMusic() {
  const [settings, setSettings] = useState<BgmSettings>(BGM_DEFAULT_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const mountedRef = useRef(false);

  const applyToAudio = useCallback((next: BgmSettings) => {
    const audio = getSharedAudio();
    if (!audio) return;
    audio.volume = next.volume;
    audio.muted = next.muted;
  }, []);

  const tryStartPlayback = useCallback(async () => {
    const audio = getSharedAudio();
    if (!audio || audio.muted) {
      setIsPlaying(false);
      setNeedsInteraction(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setNeedsInteraction(false);
    } catch {
      setIsPlaying(false);
      setNeedsInteraction(true);
      bindAutoplayUnlock(audio, () => {
        setIsPlaying(true);
        setNeedsInteraction(false);
      });
    }
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const stored = readStoredSettings();
    setSettings(stored);
    applyToAudio(stored);
    void tryStartPlayback();
  }, [applyToAudio, tryStartPlayback]);

  const updateSettings = useCallback(
    (patch: Partial<BgmSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        writeStoredSettings(next);
        applyToAudio(next);
        return next;
      });
    },
    [applyToAudio],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const clamped = Math.min(1, Math.max(0, volume));
      updateSettings({ volume: clamped, muted: clamped === 0 });
      if (clamped > 0) {
        void tryStartPlayback();
      } else {
        const audio = getSharedAudio();
        audio?.pause();
        setIsPlaying(false);
      }
    },
    [tryStartPlayback, updateSettings],
  );

  const toggleMute = useCallback(() => {
    setSettings((prev) => {
      const nextMuted = !prev.muted;
      const next =
        nextMuted || prev.volume > 0
          ? { ...prev, muted: nextMuted }
          : { ...prev, muted: false, volume: BGM_DEFAULT_SETTINGS.volume };
      writeStoredSettings(next);
      applyToAudio(next);

      if (next.muted) {
        getSharedAudio()?.pause();
        setIsPlaying(false);
        setNeedsInteraction(false);
      } else {
        void tryStartPlayback();
      }

      return next;
    });
  }, [applyToAudio, tryStartPlayback]);

  return {
    volume: settings.volume,
    muted: settings.muted,
    isPlaying,
    needsInteraction,
    setVolume,
    toggleMute,
  };
}
