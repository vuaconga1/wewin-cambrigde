"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playGameSfx } from "@/app/utils/gameSfx";
import { pickVoiceSfx } from "@/app/utils/voiceSfx";

export type AnswerFeedbackType = "correct" | "wrong";

export type AnswerFeedbackState = {
  type: AnswerFeedbackType;
  phrase: string;
  emoji: string;
  /** Unique per show — remounts badge cleanly for one CSS animation run */
  id: number;
};

const DEFAULT_DURATION_MS = 1400;

export function useAnswerFeedback(durationMs = DEFAULT_DURATION_MS) {
  const [feedback, setFeedback] = useState<AnswerFeedbackState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);
  const lastVoiceSrcRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const trigger = useCallback(
    (next: AnswerFeedbackType) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      idRef.current += 1;
      const voice = pickVoiceSfx(next, lastVoiceSrcRef.current);
      lastVoiceSrcRef.current = voice.src;
      setFeedback({
        type: next,
        phrase: voice.phrase,
        emoji: next === "correct" ? "🌟" : "💪",
        id: idRef.current,
      });
      playGameSfx(next === "correct" ? "celebration" : "wrong", voice);
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs],
  );

  return { feedback, trigger };
}
