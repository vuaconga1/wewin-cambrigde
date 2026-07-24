"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FlipCardGameConfig } from "@/types/games";
import { playWordAudio } from "@/app/utils/playWordAudio";
import { WordVisual } from "@/app/components/games/WordVisual";
import { shuffleArray } from "@/app/utils/gameWordPool";
import { playGameSfx } from "@/app/utils/gameSfx";
import {
  SeasonGamePanel,
  useGameSeasonTheme,
} from "@/app/components/games/forest-background";
import "@/app/components/games/forest-background/forest-animations.css";

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
  const [sparkleIds, setSparkleIds] = useState<Set<string>>(new Set());

  const [shuffledWords, setShuffledWords] = useState(words);
  useEffect(() => {
    setShuffledWords(shuffleArray(words));
  }, [words]);

  const hasCalledOnComplete = useRef(false);

  useEffect(() => {
    if (completed) playGameSfx("celebration");
  }, [completed]);

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
    (wordId: string) => {
      if (revealed.has(wordId)) return;

      setRevealed((prev) => new Set([...prev, wordId]));
      setSparkleIds((prev) => new Set([...prev, wordId]));
      window.setTimeout(() => {
        setSparkleIds((prev) => {
          const next = new Set(prev);
          next.delete(wordId);
          return next;
        });
      }, 700);

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
    setSparkleIds(new Set());
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
          const showSparkle = sparkleIds.has(word.id);

          return (
            <button
              key={word.id}
              onClick={() => handleReveal(word.id)}
              disabled={isRevealed}
              aria-label={isRevealed ? word.text : "Lật thẻ"}
              className={`forest-card-flip relative h-[110px] sm:h-[130px] md:h-[160px] w-full rounded-xl md:rounded-2xl ${
                showSparkle ? "forest-card-sparkle" : ""
              }`}
            >
              <div
                className={`forest-card-flip-inner h-full ${
                  isRevealed ? "is-flipped" : ""
                }`}
              >
                <div
                  className={`forest-card-face border-2 p-1.5 sm:p-2 md:p-3 ${ui.cardHidden}`}
                >
                  {ui.cardBackImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ui.cardBackImage}
                      alt=""
                      className="h-7 w-auto max-h-[70%] max-w-[85%] object-contain sm:h-9 md:h-12 select-none"
                      aria-hidden
                      draggable={false}
                    />
                  ) : (
                    <span
                      className="text-2xl sm:text-3xl md:text-5xl select-none"
                      aria-hidden
                    >
                      {ui.cardBack}
                    </span>
                  )}
                </div>

                <div
                  className={`forest-card-face forest-card-face-front border-2 p-1 sm:p-1.5 md:p-2.5 cursor-default ${ui.cardRevealed}`}
                >
                  <div className="forest-card-face-content gap-0.5 px-0.5">
                    <WordVisual
                      icon={word.icon}
                      emoji={word.emoji}
                      alt={word.text}
                      className="text-base sm:text-xl md:text-3xl shrink-0 leading-none"
                      imageClassName="h-7 w-7 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain shrink-0"
                    />
                    <div
                      className={`w-full text-[10px] sm:text-xs md:text-sm lg:text-base font-bold break-words leading-tight line-clamp-2 text-center ${ui.heading}`}
                    >
                      {word.text}
                    </div>
                    {word.meaning && (
                      <div
                        className={`w-full text-[9px] sm:text-[10px] md:text-xs lg:text-sm leading-tight line-clamp-1 text-center ${ui.subtext}`}
                      >
                        {word.meaning}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
