"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyBgmSettings,
  pauseSharedAudio,
  readStoredBgmSettings,
  resetAutoplayBinding,
  stopSharedAudio,
  tryStartBgmPlayback,
  writeStoredBgmSettings,
} from "./bgmEngine";
import {
  BGM_DEFAULT_SETTINGS,
  type BgmSettings,
  type BgmTrackId,
} from "./constants";

type BackgroundMusicContextValue = {
  volume: number;
  muted: boolean;
  trackId: BgmTrackId;
  isPlaying: boolean;
  needsInteraction: boolean;
  setVolume: (volume: number) => void;
  setTrack: (trackId: BgmTrackId) => void;
  toggleMute: () => void;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextValue | null>(
  null,
);

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BgmSettings>(BGM_DEFAULT_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => {
    const stored = readStoredBgmSettings();
    setSettings(stored);
    applyBgmSettings(stored);

    if (!stored.muted && stored.volume > 0) {
      void tryStartBgmPlayback(stored.trackId).then((result) => {
        setIsPlaying(result === "playing");
        setNeedsInteraction(result === "blocked");
      });
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.min(1, Math.max(0, volume));
    setSettings((prev) => {
      const next = { ...prev, volume: clamped, muted: clamped === 0 };
      writeStoredBgmSettings(next);
      applyBgmSettings(next);

      if (clamped > 0) {
        void tryStartBgmPlayback(next.trackId).then((result) => {
          setIsPlaying(result === "playing");
          setNeedsInteraction(result === "blocked");
        });
      } else {
        pauseSharedAudio();
        setIsPlaying(false);
      }

      return next;
    });
  }, []);

  const setTrack = useCallback(
    (trackId: BgmTrackId) => {
      setSettings((prev) => {
        if (trackId === prev.trackId) return prev;

        stopSharedAudio();
        resetAutoplayBinding();
        setIsPlaying(false);

        const next = { ...prev, trackId };
        writeStoredBgmSettings(next);
        applyBgmSettings(next);

        if (!next.muted && next.volume > 0) {
          void tryStartBgmPlayback(trackId).then((result) => {
            setIsPlaying(result === "playing");
            setNeedsInteraction(result === "blocked");
          });
        }

        return next;
      });
    },
    [],
  );

  const toggleMute = useCallback(() => {
    setSettings((prev) => {
      const nextMuted = !prev.muted;
      const next =
        nextMuted || prev.volume > 0
          ? { ...prev, muted: nextMuted }
          : { ...prev, muted: false, volume: BGM_DEFAULT_SETTINGS.volume };
      writeStoredBgmSettings(next);
      applyBgmSettings(next);

      if (next.muted) {
        pauseSharedAudio();
        setIsPlaying(false);
        setNeedsInteraction(false);
      } else {
        void tryStartBgmPlayback(next.trackId).then((result) => {
          setIsPlaying(result === "playing");
          setNeedsInteraction(result === "blocked");
        });
      }

      return next;
    });
  }, []);

  const value = useMemo<BackgroundMusicContextValue>(
    () => ({
      volume: settings.volume,
      muted: settings.muted,
      trackId: settings.trackId,
      isPlaying,
      needsInteraction,
      setVolume,
      setTrack,
      toggleMute,
    }),
    [
      isPlaying,
      needsInteraction,
      setTrack,
      setVolume,
      settings.muted,
      settings.trackId,
      settings.volume,
      toggleMute,
    ],
  );

  return (
    <BackgroundMusicContext.Provider value={value}>
      {children}
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic() {
  const ctx = useContext(BackgroundMusicContext);
  if (!ctx) {
    throw new Error("useBackgroundMusic must be used within BackgroundMusicProvider");
  }
  return ctx;
}
