"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import type { WordItem, WordOrderingGameConfig } from "@/types/games";
import { AnswerFeedback } from "@/app/components/games/AnswerFeedback";
import { GameSummaryModal } from "@/app/components/games/GameSummaryModal";
import { SpeedScoreBar } from "@/app/components/games/SpeedScoreBar";
import { useAnswerFeedback } from "@/app/components/games/useAnswerFeedback";
import { useSpeedScoreTimer } from "@/app/components/games/useSpeedScoreTimer";
import { WordVisual } from "@/app/components/games/WordVisual";
import { buildOrderingRounds, shuffleArray } from "@/app/utils/gameWordPool";
import { SPEED_SCORE_MAX } from "@/app/utils/speedScore";
import {
  SeasonGamePanel,
  useGameSeasonTheme,
} from "@/app/components/games/forest-background";

type Props = WordOrderingGameConfig & {
  onComplete?: (score: number) => void;
  onChooseOtherGame?: () => void;
};

type WordChoice = {
  id: string;
  text: string;
  originalIndex: number;
};

function toChoices(roundWords: WordItem[]): WordChoice[] {
  return roundWords.map((word, idx) => ({
    id: word.id,
    text: word.text,
    originalIndex: idx,
  }));
}

export function WordOrderingGame({
  title,
  words,
  showScore = true,
  onComplete,
  onChooseOtherGame,
}: Props) {
  const { ui } = useGameSeasonTheme("ordering");
  const [rounds, setRounds] = useState<WordItem[][]>(() =>
    buildOrderingRounds(words),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<WordChoice[]>([]);
  const [availableWords, setAvailableWords] = useState<WordChoice[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState("Sắp xếp các từ theo thứ tự bảng chữ cái!");
  const [statusType, setStatusType] = useState<"info" | "correct" | "warning">(
    "info",
  );
  const { feedback, trigger: triggerFeedback } = useAnswerFeedback();
  const speedTimer = useSpeedScoreTimer();

  const totalRounds = Math.max(rounds.length, 1);
  const currentRound = rounds[currentIndex] ?? [];
  const sortedAnswer = [...currentRound].sort((a, b) =>
    a.text.localeCompare(b.text, "en", { sensitivity: "base" }),
  );

  const startRound = useCallback((roundWords: WordItem[]) => {
    setAvailableWords(shuffleArray(toChoices(roundWords)));
    setSelectedWords([]);
    setStatus("Sắp xếp các từ theo thứ tự bảng chữ cái!");
    setStatusType("info");
  }, []);

  // Rebuild rounds when vocabulary changes
  useEffect(() => {
    setRounds(buildOrderingRounds(words));
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
  }, [words]);

  // Deal cards for the active round + start speed timer
  useEffect(() => {
    const round = rounds[currentIndex];
    if (!round || completed) return;
    startRound(round);
    speedTimer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only on new round
  }, [currentIndex, rounds, completed, startRound]);

  const handleSelectWord = useCallback((word: WordChoice) => {
    setSelectedWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((w) => w.id !== word.id));
  }, []);

  const handleRemoveWord = useCallback((word: WordChoice) => {
    setSelectedWords((prev) => prev.filter((w) => w.id !== word.id));
    setAvailableWords((prev) => shuffleArray([...prev, word]));
  }, []);

  const handleCheck = useCallback(() => {
    if (selectedWords.length !== sortedAnswer.length) {
      setStatus("Hãy sắp xếp đủ tất cả các từ!");
      setStatusType("warning");
      setWrongCount((prev) => prev + 1);
      return;
    }

    const isCorrect = selectedWords.every(
      (word, index) => word.id === sortedAnswer[index].id,
    );

    if (isCorrect) {
      triggerFeedback("correct");
      const pointsEarned = speedTimer.claimScore();
      const nextScore = score + pointsEarned;
      setScore(nextScore);
      setCorrectCount((prev) => prev + 1);
      setStatus(
        `🎉 Tuyệt vời! +${pointsEarned} điểm (Tổng: ${nextScore} điểm)`,
      );
      setStatusType("correct");

      setTimeout(() => {
        if (currentIndex >= totalRounds - 1) {
          setStatus(
            `🌟 Xuất sắc! Bạn đã hoàn thành tất cả! Tổng điểm: ${nextScore} điểm`,
          );
          setCompleted(true);
          onComplete?.(nextScore);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 1200);
    } else {
      triggerFeedback("wrong");
      setWrongCount((prev) => prev + 1);
      setStatus(`Ôi, thứ tự chưa đúng. Hãy thử lại nhé! (Tổng: ${score} điểm)`);
      setStatusType("warning");
    }
  }, [
    selectedWords,
    sortedAnswer,
    score,
    currentIndex,
    totalRounds,
    onComplete,
    triggerFeedback,
    speedTimer,
  ]);

  const handleReset = useCallback(() => {
    setRounds(buildOrderingRounds(words));
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
  }, [words]);

  const progress = ((currentIndex + 1) / totalRounds) * 100;

  const renderWordButton = (
    word: WordChoice,
    onClick: () => void,
    extra?: ReactNode,
  ) => {
    const originalWord =
      currentRound.find((w) => w.id === word.id) ??
      words.find((w) => w.id === word.id);
    return (
      <button
        key={`${word.id}-${word.originalIndex}`}
        onClick={onClick}
        className={`border-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold text-base sm:text-lg md:text-xl shadow-md hover:shadow-lg transition hover:-translate-y-1 flex items-center gap-2 w-full sm:w-auto max-w-full justify-center sm:justify-start ${ui.tile}`}
      >
        <WordVisual
          icon={originalWord?.icon}
          emoji={originalWord?.emoji}
          alt={word.text}
          className="text-2xl sm:text-3xl"
          imageClassName="h-8 w-8 sm:h-10 sm:w-10 object-contain"
        />
        <span>{word.text}</span>
        {extra}
      </button>
    );
  };

  return (
    <SeasonGamePanel game="ordering" maxWidth="5xl">
        <AnswerFeedback feedback={feedback} />
        <header className="text-center">
          <p className={`text-sm uppercase tracking-wide ${ui.label}`}>
            Word Ordering
          </p>
          <h2 className={`text-xl sm:text-2xl font-semibold ${ui.heading}`}>
            {title}
          </h2>
          <p className={`mt-2 text-base sm:text-lg ${ui.subtext}`}>
            Sắp xếp các từ theo thứ tự bảng chữ cái (A-Z)!
          </p>
          <SpeedScoreBar
            theme="ordering"
            score={score}
            maxScore={totalRounds * SPEED_SCORE_MAX}
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
              <span className={`text-xs sm:text-sm ${ui.label}`}>📚 Bộ từ</span>
              <span className={`text-lg sm:text-xl font-bold ${ui.heading}`}>
                {currentIndex + 1}/{totalRounds}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5">
              <span className={`text-xs sm:text-sm ${ui.label}`}>✅ Đúng</span>
              <span className={`text-lg sm:text-xl font-bold ${ui.heading}`}>{correctCount}</span>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className={`text-center text-lg sm:text-xl font-semibold mb-4 ${ui.heading}`}>
            Thứ tự bạn đã chọn:
          </h3>
          <div className={`flex flex-wrap gap-3 justify-center min-h-[80px] p-4 rounded-xl border-2 ${ui.dropZone}`}>
            {selectedWords.length === 0 ? (
              <p className="text-gray-400 text-base sm:text-lg">
                Nhấn vào các từ bên dưới để sắp xếp
              </p>
            ) : (
              selectedWords.map((word, index) =>
                renderWordButton(
                  word,
                  () => handleRemoveWord(word),
                  <span className="text-sm bg-white/30 px-2 py-1 rounded-full">
                    {index + 1}
                  </span>,
                ),
              )
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className={`text-center text-lg sm:text-xl font-semibold mb-4 ${ui.heading}`}>
            Các từ cần sắp xếp:
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {availableWords.map((word) =>
              renderWordButton(word, () => handleSelectWord(word)),
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleCheck}
            disabled={selectedWords.length !== sortedAnswer.length}
            className={`rounded-xl px-6 py-3 font-bold text-white transition w-full sm:w-auto ${
              selectedWords.length !== sortedAnswer.length
                ? "bg-gray-400 cursor-not-allowed"
                : ui.primaryBtn
            }`}
          >
            ✅ Kiểm tra
          </button>
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
                ? "bg-orange-100 text-orange-800"
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
          game="ordering"
          score={score}
          correctCount={correctCount}
          wrongCount={wrongCount}
          totalCount={totalRounds}
          onPlayAgain={handleReset}
          onChooseOtherGame={onChooseOtherGame}
        />
    </SeasonGamePanel>
  );
}
