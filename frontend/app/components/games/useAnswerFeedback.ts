"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playGameSfx } from "@/app/utils/gameSfx";

export type AnswerFeedbackType = "correct" | "wrong";

export type AnswerFeedbackState = {
  type: AnswerFeedbackType;
  phrase: string;
  emoji: string;
  /** Unique per show — remounts badge cleanly for one CSS animation run */
  id: number;
};

const CORRECT_LINES = [
  { phrase: "Correct!", emoji: "🎉" },
  { phrase: "Great!", emoji: "⭐" },
  { phrase: "Awesome!", emoji: "🚀" },
  { phrase: "Well done!", emoji: "👏" },
  { phrase: "Perfect!", emoji: "✨" },
  { phrase: "Excellent!", emoji: "🌟" },
  { phrase: "Nice job!", emoji: "💯" },
  { phrase: "Super!", emoji: "🦄" },
  { phrase: "Fantastic!", emoji: "🎊" },
  { phrase: "Good job!", emoji: "👍" },
] as const;

const WRONG_LINES = [
  { phrase: "Wrong!", emoji: "💪" },
  { phrase: "Try again!", emoji: "🔄" },
  { phrase: "Oops!", emoji: "😅" },
  { phrase: "Not quite!", emoji: "🤔" },
  { phrase: "Keep trying!", emoji: "💪" },
  { phrase: "Almost!", emoji: "👀" },
  { phrase: "So close!", emoji: "✨" },
  { phrase: "Oh no!", emoji: "🙈" },
] as const;

function pickLine(
  type: AnswerFeedbackType,
  lastPhrase: string | null,
): { phrase: string; emoji: string } {
  const pool = type === "correct" ? CORRECT_LINES : WRONG_LINES;
  const candidates = lastPhrase
    ? pool.filter((line) => line.phrase !== lastPhrase)
    : pool;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0];
}

const DEFAULT_DURATION_MS = 1400;

export function useAnswerFeedback(durationMs = DEFAULT_DURATION_MS) {
  const [feedback, setFeedback] = useState<AnswerFeedbackState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);
  const lastPhraseRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const trigger = useCallback(
    (next: AnswerFeedbackType) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      idRef.current += 1;
      const line = pickLine(next, lastPhraseRef.current);
      lastPhraseRef.current = line.phrase;
      setFeedback({
        type: next,
        phrase: line.phrase,
        emoji: line.emoji,
        id: idRef.current,
      });
      playGameSfx(next === "correct" ? "celebration" : "wrong");
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs],
  );

  return { feedback, trigger };
}
