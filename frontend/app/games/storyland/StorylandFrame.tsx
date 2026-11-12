"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  pauseSharedAudio,
  setBgmSuppressed,
} from "@/app/components/audio";
import {
  FantasyForestBackground,
  isForestSeason,
  useForestTheme,
  type ForestSeason,
} from "@/app/components/games/forest-background";

const THEME_MESSAGE = "wewin:forest-theme";

export function StorylandFrame() {
  const { theme, setTheme, config } = useForestTheme();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Tự động tắt nhạc nền khi vào Storyland và khôi phục khi rời đi
  useEffect(() => {
    setBgmSuppressed(true);
    pauseSharedAudio();
    return () => {
      setBgmSuppressed(false);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const postTheme = useCallback((season: ForestSeason) => {
    frameRef.current?.contentWindow?.postMessage(
      { type: THEME_MESSAGE, theme: season },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    postTheme(theme);
  }, [theme, postTheme]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: string; theme?: unknown } | null;
      if (data?.type === THEME_MESSAGE && isForestSeason(data.theme)) {
        setTheme(data.theme);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setTheme]);

  return (
    <div className="relative w-full" style={{ height: "100dvh" }}>
      <FantasyForestBackground config={config} reducedMotion={reducedMotion} />
      <iframe
        ref={frameRef}
        src="/storyland/index.html"
        title="WeWIN Storyland"
        onLoad={() => postTheme(theme)}
        className="relative z-10 block h-full w-full border-0 bg-transparent"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
