"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  potentialSpeedScore,
  speedScorePercent,
  SPEED_SCORE_CAP_MS,
  SPEED_SCORE_GRACE_MS,
} from "@/app/utils/speedScore";

type Options = {
  /** Hold full points for this long before decay starts. */
  graceMs?: number;
};

export function useSpeedScoreTimer(options: Options = {}) {
  const graceMs = options.graceMs ?? SPEED_SCORE_GRACE_MS;
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const graceRef = useRef(graceMs);
  graceRef.current = graceMs;

  const tick = useCallback(() => {
    if (startRef.current === null) return;
    setElapsedMs(Date.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startRef.current = Date.now();
    setElapsedMs(0);
    setRunning(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    setRunning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    startRef.current = null;
    setElapsedMs(0);
  }, [stop]);

  /** Capture final score and reset timer for next question. */
  const claimScore = useCallback(() => {
    const elapsed =
      startRef.current !== null ? Date.now() - startRef.current : SPEED_SCORE_CAP_MS;
    const points = potentialSpeedScore(elapsed, graceRef.current);
    reset();
    return points;
  }, [reset]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    elapsedMs,
    running,
    potentialScore: potentialSpeedScore(elapsedMs, graceMs),
    percent: speedScorePercent(elapsedMs, graceMs),
    start,
    stop,
    reset,
    claimScore,
  };
}
