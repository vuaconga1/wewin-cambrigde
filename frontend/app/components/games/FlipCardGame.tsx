"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FlipCardGameConfig } from "@/types/games";
import { playWordAudio } from "@/app/utils/playWordAudio";
import { WordVisual } from "@/app/components/games/WordVisual";
import { shuffleArray } from "@/app/utils/gameWordPool";
import {
  SeasonGamePanel,
  useGameSeasonTheme,
} from "@/app/components/games/forest-background";

type Props = FlipCardGameConfig & {
  onComplete?: (score: number) => void;
  onChooseOtherGame?: () => void;
};

export function FlipCardGame({
  title,
  words,
  autoAudio = true,
  audioContext,
  onComplete,
  onChooseOtherGame,
}: Props) {
  const { ui } = useGameSeasonTheme("flip");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [revealedCount, setRevealedCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const [shuffledWords, setShuffledWords] = useState(words);
  useEffect(() => {
    setShuffledWords(shuffleArray(words));
  }, [words]);

  const hasCalledOnComplete = useRef(false);

  useEffect(() => {
    if (completed && onComplete && !hasCalledOnComplete.current) {
      hasCalledOnComplete.current = true;
      const timer = setTimeout(() => {
        onComplete(revealedCount * 10);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [completed, onComplete, revealedCount]);

  useEffect(() => {
    if (!completed) {
      hasCalledOnComplete.current = false;
    }
  }, [completed]);

  const handleReveal = useCallback(
    (wordId: string, wordText: string) => {
      if (revealed.has(wordId)) return;

      setRevealed((prev) => new Set([...prev, wordId]));
      setRevealedCount((prev) => {
        const next = prev + 1;
        if (!completed && next === shuffledWords.length) {
          setCompleted(true);
        }
        return next;
      });

      if (autoAudio) {
        const word = shuffledWords.find((w) => w.id === wordId);
        if (word) {
          playWordAudio(word, audioContext);
        }
      }
    },
    [revealed, autoAudio, audioContext, completed, shuffledWords],
  );

  const handleReset = useCallback(() => {
    setShuffledWords(shuffleArray(words));
    setRevealed(new Set());
    setRevealedCount(0);
    setCompleted(false);
  }, [words]);

  return (
    <SeasonGamePanel game="flip" maxWidth="5xl">
      <header className="text-center">
        <h2 className={`text-xl sm:text-2xl font-semibold ${ui.heading}`}>{title}</h2>
        <p className={`mt-2 text-base sm:text-lg ${ui.subtext}`}>
          Nhấn vào từng thẻ để xem toàn bộ từ và nghe phát âm.
        </p>
      </header>

      <div className={`mt-4 text-center text-lg sm:text-xl font-bold ${ui.heading}`}>
        Đã mở: <span>{revealedCount}</span>/{shuffledWords.length}
      </div>

      {revealedCount === shuffledWords.length && shuffledWords.length > 0 && (
        <div className={`mt-4 text-center text-xl sm:text-2xl font-bold ${ui.statusSuccess} rounded-xl py-2`}>
          🎉 Tuyệt vời! Bạn đã mở hết tất cả các thẻ! 🎉
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {shuffledWords.map((word) => {
          const isRevealed = revealed.has(word.id);

          return (
            <button
              key={word.id}
              onClick={() => handleReveal(word.id, word.text)}
              disabled={isRevealed}
              aria-label={isRevealed ? word.text : "Lật thẻ"}
              className={`rounded-xl md:rounded-2xl border-2 p-1.5 sm:p-2.5 md:p-6 text-center transition-all min-h-[78px] sm:min-h-[88px] md:min-h-[120px] flex items-center justify-center ${
                isRevealed ? `${ui.cardRevealed} cursor-default` : ui.cardHidden
              }`}
            >
              {isRevealed ? (
                <div className="flex flex-col items-center justify-center w-full">
                  <WordVisual
                    icon={word.icon}
                    emoji={word.emoji}
                    alt={word.text}
                    className="text-lg sm:text-2xl md:text-4xl lg:text-5xl mb-1 md:mb-2"
                    imageClassName="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 object-contain"
                  />
                  <div className={`text-[11px] sm:text-sm md:text-xl lg:text-2xl font-bold break-words leading-tight ${ui.heading}`}>
                    {word.text}
                  </div>
                  {word.meaning && (
                    <div className={`mt-1 text-[10px] sm:text-xs md:text-base lg:text-lg leading-tight ${ui.subtext}`}>
                      {word.meaning}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl select-none" aria-hidden>
                  {ui.cardBack}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className={`rounded-full px-6 py-3 font-bold text-white shadow-lg transition w-full sm:w-auto ${ui.primaryBtn}`}
        >
          🔄 Chơi lại
        </button>
        {onChooseOtherGame && (
          <button
            onClick={onChooseOtherGame}
            className={`rounded-full px-6 py-3 font-bold shadow-lg transition w-full sm:w-auto ${ui.secondaryBtn}`}
          >
            🎮 Chọn Game Khác
          </button>
        )}
      </div>
    </SeasonGamePanel>
  );
}
