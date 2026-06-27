"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlipCardGameConfig } from "@/types/games";
import { playWordAudio } from "@/app/utils/playWordAudio";
import { WordVisual } from "@/app/components/games/WordVisual";

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
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [revealedCount, setRevealedCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Tránh dùng Math.random trong render SSR gây lệch hydration
  const [shuffledWords, setShuffledWords] = useState(words);
  useEffect(() => {
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
  }, [words]);

  // Gọi onComplete một lần duy nhất khi game hoàn thành
  // Sử dụng useRef để track xem đã gọi onComplete chưa, tránh gọi nhiều lần
  const hasCalledOnComplete = useRef(false);
  
  useEffect(() => {
    if (completed && onComplete && !hasCalledOnComplete.current) {
      hasCalledOnComplete.current = true;
      // Sử dụng setTimeout để đảm bảo được gọi sau khi render hoàn tất
      const timer = setTimeout(() => {
        onComplete(revealedCount * 10);
      }, 100); // Tăng delay một chút để đảm bảo state đã ổn định
      return () => clearTimeout(timer);
    }
  }, [completed, onComplete]);
  
  // Reset flag khi game được reset
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
        if (!completed && next === words.length) {
          setCompleted(true);
          // Không gọi onComplete ở đây nữa, để useEffect xử lý
        }
        return next;
      });

      if (autoAudio) {
        const word = words.find((w) => w.id === wordId);
        if (word) {
          playWordAudio(word, audioContext);
        }
      }
    },
    [revealed, autoAudio, audioContext, completed, words],
  );

  const handleReset = useCallback(() => {
    setRevealed(new Set());
    setRevealedCount(0);
    setCompleted(false);
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-100 bg-fixed py-4 md:py-8 lg:py-10 px-1 md:px-4 lg:px-6">
      <div className="rounded-xl md:rounded-2xl border border-sky-100 bg-white/90 p-3 md:p-6 shadow-lg max-w-4xl md:max-w-5xl mx-auto">
      <header className="text-center">
     
        <h2 className="text-xl sm:text-2xl font-semibold text-sky-900">{title}</h2>
        <p className="mt-2 text-base sm:text-lg text-sky-700">
          Nhấn vào từng thẻ để xem toàn bộ từ và nghe phát âm.
        </p>
      </header>

      <div className="mt-4 text-center text-lg sm:text-xl font-bold text-sky-800">
        Đã mở: <span>{revealedCount}</span>/{words.length}
      </div>

      {revealedCount === words.length && (
        <div className="mt-4 text-center text-xl sm:text-2xl font-bold text-sky-600">
          🎉 Tuyệt vời! Bạn đã mở hết tất cả các thẻ! 🎉
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {shuffledWords.map((word) => {
          const isRevealed = revealed.has(word.id);
          const cleanWord = word.text.replace(/[\s-]/g, "");
          const dots = ".".repeat(Math.max(cleanWord.length - 1, 1));

          return (
            <button
              key={word.id}
              onClick={() => handleReveal(word.id, word.text)}
              disabled={isRevealed}
              className={`rounded-xl md:rounded-2xl border-2 p-2.5 md:p-6 text-center transition-all min-h-[88px] md:min-h-0 ${
                isRevealed
                  ? "border-sky-300 bg-sky-100 cursor-default"
                    : "border-sky-200 bg-gradient-to-br from-sky-100 via-sky-200 to-blue-200 hover:border-sky-300 hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {isRevealed ? (
                <>
                  <WordVisual
                    icon={word.icon}
                    emoji={word.emoji}
                    alt={word.text}
                    className="text-2xl md:text-4xl lg:text-5xl mb-1 md:mb-2"
                    imageClassName="h-12 w-12 md:h-16 md:w-16 object-contain"
                  />
                  <div className="text-sm md:text-xl lg:text-2xl font-bold text-sky-900 break-words">
                    {word.text}
                  </div>
                  {word.meaning && (
                    <div className="mt-1 text-xs md:text-base lg:text-lg text-sky-700">
                      {word.meaning}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <WordVisual
                    icon={word.icon}
                    emoji={word.emoji}
                    alt={word.text}
                    className="text-2xl md:text-4xl lg:text-5xl mb-1 md:mb-2"
                    imageClassName="h-12 w-12 md:h-16 md:w-16 object-contain"
                  />
                  <div className="text-sm md:text-2xl lg:text-3xl font-bold text-sky-600 break-words">
                    {word.text[0].toUpperCase()}
                    {dots}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto"
        >
          🔄 Chơi lại
        </button>
        {onChooseOtherGame && (
          <button
            onClick={onChooseOtherGame}
            className="rounded-full border-2 border-sky-500 bg-white px-6 py-3 font-bold text-sky-600 shadow-lg transition hover:shadow-xl hover:bg-sky-50 hover:-translate-y-0.5 w-full sm:w-auto"
          >
            🎮 Chọn Game Khác
          </button>
        )}
      </div>
      </div>
    </section>
  );
}

