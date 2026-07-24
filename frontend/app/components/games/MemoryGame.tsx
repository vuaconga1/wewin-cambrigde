"use client";

import { useCallback, useEffect, useState } from "react";
import type { MemoryGameConfig, WordItem } from "@/types/games";
import { AnswerFeedback } from "@/app/components/games/AnswerFeedback";
import { GameSummaryModal } from "@/app/components/games/GameSummaryModal";
import { SpeedScoreBar } from "@/app/components/games/SpeedScoreBar";
import { useAnswerFeedback } from "@/app/components/games/useAnswerFeedback";
import { pickMemoryWords, shuffleArray } from "@/app/utils/gameWordPool";
import {
  MEMORY_PAIR_SCORE,
  memoryPairPoints,
} from "@/app/utils/speedScore";
import { playWordAudio } from "@/app/utils/playWordAudio";
import { WordVisual } from "@/app/components/games/WordVisual";
import {
  SeasonGamePanel,
  useGameSeasonTheme,
} from "@/app/components/games/forest-background";

type Props = MemoryGameConfig & {
  onComplete?: (score: number) => void;
  onChooseOtherGame?: () => void;
};

type Card = {
  id: string;
  wordId: string;
  text: string;
  icon?: string;
  emoji?: string;
  meaning?: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export function MemoryGame({
  title,
  words,
  showScore = true,
  audioContext,
  onComplete,
  onChooseOtherGame,
}: Props) {
  const { ui } = useGameSeasonTheme("memory");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState("Lật 2 thẻ để tìm cặp từ khớp!");
  const [statusType, setStatusType] = useState<"info" | "correct" | "warning">("info");
  const [isChecking, setIsChecking] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [sessionWords, setSessionWords] = useState<WordItem[]>([]);
  const [flipCounts, setFlipCounts] = useState<Record<string, number>>({});
  const { feedback, trigger: triggerFeedback } = useAnswerFeedback();

  // Tạo bộ thẻ từ danh sách từ (tối đa 8 cặp, random mỗi lần chơi)
  const initializeCards = useCallback(() => {
    const selected = pickMemoryWords(words);
    setSessionWords(selected);
    const cardPairs: Card[] = [];

    selected.forEach((word) => {
      cardPairs.push({
        id: `word-${word.id}`,
        wordId: word.id,
        text: word.text,
        icon: word.icon,
        emoji: word.emoji,
        meaning: word.meaning,
        isFlipped: false,
        isMatched: false,
      });

      cardPairs.push({
        id: `meaning-${word.id}`,
        wordId: word.id,
        text: word.meaning || word.text,
        icon: word.icon,
        emoji: word.emoji,
        meaning: word.meaning,
        isFlipped: false,
        isMatched: false,
      });
    });

    return shuffleArray(cardPairs);
  }, [words]);

  // Khởi tạo game
  useEffect(() => {
    const newCards = initializeCards();
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setScore(0);
    setMoves(0);
    setFlipCounts({});
    setStatus("Lật 2 thẻ để tìm cặp từ khớp!");
    setStatusType("info");
    setCompleted(false);
    setIsChecking(false);
  }, [initializeCards]);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (isChecking || flippedCards.length >= 2 || completed) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      const newFlipped = [...flippedCards, cardId];
      const nextFlipCounts = {
        ...flipCounts,
        [cardId]: (flipCounts[cardId] || 0) + 1,
      };
      setFlipCounts(nextFlipCounts);

      // Cập nhật trạng thái lật
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
      );
      setFlippedCards(newFlipped);

      if (card.id.startsWith("word-")) {
        const word = sessionWords.find((w) => w.id === card.wordId);
        if (word) {
          playWordAudio(word, audioContext);
        }
      }

      // Nếu đã lật 2 thẻ, kiểm tra
      if (newFlipped.length === 2) {
        setIsChecking(true);
        const currentMoves = moves + 1;
        setMoves(currentMoves);

        const [firstId, secondId] = newFlipped;
        const firstCard = cards.find((c) => c.id === firstId);
        const secondCard = cards.find((c) => c.id === secondId);
        const pairTotal = sessionWords.length;

        if (firstCard && secondCard && firstCard.wordId === secondCard.wordId) {
          triggerFeedback("correct");
          const pointsEarned = memoryPairPoints(
            nextFlipCounts[firstId] || 0,
            nextFlipCounts[secondId] || 0,
          );

          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.wordId === firstCard.wordId ? { ...c, isMatched: true, isFlipped: true } : c,
              ),
            );

            // Không gọi setState lồng nhau trong updater — React Strict Mode
            // chạy updater 2 lần và sẽ cộng điểm đôi (100 → 200).
            const newCount = matchedPairs + 1;
            const newScore = score + pointsEarned;
            setMatchedPairs(newCount);
            setScore(newScore);
            setStatus(
              `🎉 Tuyệt vời! +${pointsEarned} điểm (Tổng: ${newScore} điểm)`,
            );
            setStatusType("correct");

            if (newCount === pairTotal) {
              setTimeout(() => {
                setStatus(
                  `🌟 Xuất sắc! Bạn đã hoàn thành tất cả các cặp! Tổng điểm: ${newScore} điểm`,
                );
                setCompleted(true);
                onComplete?.(newScore);
              }, 1000);
            }

            setFlippedCards([]);
            setIsChecking(false);
          }, 500);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c,
              ),
            );
            setFlippedCards([]);
            setWrongCount((prev) => prev + 1);

            setStatus(`Ôi, chưa khớp đâu. Hãy thử lại nhé! (Tổng: ${score} điểm)`);
            setStatusType("warning");

            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [
      cards,
      flippedCards,
      flipCounts,
      isChecking,
      matchedPairs,
      moves,
      sessionWords,
      audioContext,
      onComplete,
      completed,
      triggerFeedback,
      score,
    ],
  );

  const handleReset = useCallback(() => {
    const newCards = initializeCards();
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setScore(0);
    setMoves(0);
    setWrongCount(0);
    setFlipCounts({});
    setStatus("Lật 2 thẻ để tìm cặp từ khớp!");
    setStatusType("info");
    setIsChecking(false);
    setCompleted(false);
  }, [initializeCards]);

  const pairTotal = Math.max(sessionWords.length, 1);
  const progress = (matchedPairs / pairTotal) * 100;
  const maxScore = Math.max(sessionWords.length, 1) * MEMORY_PAIR_SCORE;

  return (
    <SeasonGamePanel game="memory" maxWidth="5xl" className="relative">
      <AnswerFeedback feedback={feedback} motion="flyUp" />
      <header className="text-center">
        <p className={`text-sm uppercase tracking-wide ${ui.label}`}>Memory</p>
        <h2 className={`text-xl sm:text-2xl font-semibold ${ui.heading}`}>{title}</h2>
        <p className={`mt-2 text-base sm:text-lg ${ui.subtext}`}>
          Lật 2 thẻ để tìm cặp từ khớp!
        </p>
        <SpeedScoreBar
          theme="memory"
          score={score}
          maxScore={maxScore}
          visible={!completed}
        />
      </header>

      {showScore && (
        <div className={`mt-4 flex items-center justify-around gap-2 rounded-xl px-3 py-2 shadow-sm divide-x ${ui.statBg} ${ui.statDivider}`}>
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <span className={`text-xs sm:text-sm ${ui.label}`}>⭐ Điểm</span>
            <span className={`text-lg sm:text-xl font-bold ${ui.heading}`}>{score}</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <span className={`text-xs sm:text-sm ${ui.label}`}>🎯 Cặp</span>
            <span className={`text-lg sm:text-xl font-bold ${ui.heading}`}>
              {matchedPairs}/{sessionWords.length}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <span className={`text-xs sm:text-sm ${ui.label}`}>🔄 Nước đi</span>
            <span className={`text-lg sm:text-xl font-bold ${ui.heading}`}>{moves}</span>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
        {cards.map((card) => {
          const isFlipped = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isFlipped || isChecking || card.isMatched || completed}
              className={`aspect-square rounded-lg md:rounded-xl border-2 p-1 md:p-4 transition-all duration-300 overflow-hidden ${
                card.isMatched
                  ? `${ui.cardMatched} cursor-default`
                  : isFlipped
                    ? `${ui.cardRevealed} shadow-lg`
                    : ui.cardHidden
              }`}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center justify-center h-full min-w-0 w-full overflow-hidden">
                  <WordVisual
                    icon={card.icon}
                    emoji={card.emoji}
                    alt={card.text}
                    className="text-base sm:text-xl md:text-4xl lg:text-5xl mb-0.5 md:mb-2 shrink-0"
                    imageClassName="h-7 w-7 sm:h-10 sm:w-10 md:h-14 md:w-14 object-contain"
                  />
                  <div className={`text-[8px] sm:text-[10px] md:text-base lg:text-lg font-bold text-center leading-tight line-clamp-2 w-full px-0.5 ${ui.heading}`}>
                    {card.text}
                  </div>
                  {card.meaning && card.id.startsWith("meaning-") && (
                    <div className={`text-[7px] sm:text-[9px] md:text-sm mt-0.5 md:mt-1 line-clamp-1 w-full px-0.5 ${ui.subtext}`}>
                      {card.meaning}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  {ui.cardBackImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ui.cardBackImage}
                      alt=""
                      className="h-7 w-auto max-w-[85%] object-contain sm:h-9 md:h-12 select-none"
                      aria-hidden
                      draggable={false}
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl md:text-5xl lg:text-6xl">{ui.cardBack}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleReset}
          className={`rounded-xl px-6 py-3 font-bold text-white transition hover:shadow-lg w-full sm:w-auto ${ui.primaryBtn}`}
        >
          🔄 Chơi lại
        </button>
      </div>

      <div
        className={`mt-6 rounded-xl p-4 text-center font-bold text-lg sm:text-xl ${
          statusType === "correct"
            ? ui.statusSuccess
            : statusType === "warning"
              ? ui.statusInfo
              : ui.statusInfo
        }`}
      >
        {status}
      </div>

      <div className={`mt-4 h-2 rounded-full overflow-hidden ${ui.progressTrack}`}>
        <div
          className={`h-full transition-all duration-300 ${ui.progressFill}`}
          style={{ width: `${progress}%` }}
        />
      </div>

        <GameSummaryModal
          open={completed}
          game="memory"
        score={score}
        correctCount={matchedPairs}
        wrongCount={wrongCount}
        totalCount={sessionWords.length}
        onPlayAgain={handleReset}
        onChooseOtherGame={onChooseOtherGame}
      />
    </SeasonGamePanel>
  );
}
