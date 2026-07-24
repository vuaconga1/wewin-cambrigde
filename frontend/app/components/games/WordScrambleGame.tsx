"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WordItem, WordScrambleGameConfig } from "@/types/games";
import { AnswerFeedback } from "@/app/components/games/AnswerFeedback";
import { GameSummaryModal } from "@/app/components/games/GameSummaryModal";
import { SpeedScoreBar } from "@/app/components/games/SpeedScoreBar";
import { useAnswerFeedback } from "@/app/components/games/useAnswerFeedback";
import { useSpeedScoreTimer } from "@/app/components/games/useSpeedScoreTimer";
import { WordVisual } from "@/app/components/games/WordVisual";
import { shuffleArray } from "@/app/utils/gameWordPool";
import { SPEED_SCORE_MAX } from "@/app/utils/speedScore";
import { playGameSfx } from "@/app/utils/gameSfx";
import {
  SeasonGamePanel,
  useGameSeasonTheme,
} from "@/app/components/games/forest-background";

type Props = WordScrambleGameConfig & {
  onComplete?: (score: number) => void;
  onChooseOtherGame?: () => void;
};

export function WordScrambleGame({
  title,
  words,
  showScore = true,
  onComplete,
  onChooseOtherGame,
}: Props) {
  const { ui } = useGameSeasonTheme("scramble");
  const [playWords, setPlayWords] = useState<WordItem[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState("Sắp xếp các chữ cái để tạo thành từ đúng!");
  const [statusType, setStatusType] = useState<"info" | "correct" | "warning">("info");
  const { feedback, trigger: triggerFeedback } = useAnswerFeedback();
  const speedTimer = useSpeedScoreTimer();

  useEffect(() => {
    setPlayWords(shuffleArray(words));
    setCurrentIndex(0);
    setUserInput("");
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
    setStatus("Sắp xếp các chữ cái để tạo thành từ đúng!");
    setStatusType("info");
  }, [words]);

  useEffect(() => {
    if (completed || playWords.length === 0) return;
    speedTimer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- new word only
  }, [currentIndex, completed, playWords.length]);

  const currentWord = playWords[currentIndex];
  const totalWords = Math.max(playWords.length, 1);

  const scrambledWord = useMemo(() => {
    if (!currentWord) return "";
    const letters = currentWord.text.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("").toUpperCase();
  }, [currentIndex, currentWord?.id, currentWord?.text]);

  const handleSubmit = useCallback(() => {
    if (!currentWord) return;

    if (!userInput.trim()) {
      setStatus("Hãy nhập từ của bạn!");
      setStatusType("warning");
      return;
    }

    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = currentWord.text.toLowerCase();

    if (userAnswer === correctAnswer) {
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
        if (currentIndex >= playWords.length - 1) {
          setStatus(
            `🌟 Xuất sắc! Bạn đã hoàn thành tất cả các từ! Tổng điểm: ${nextScore} điểm`,
          );
          setCompleted(true);
          onComplete?.(nextScore);
        } else {
          playGameSfx("levelComplete");
          setCurrentIndex((prev) => prev + 1);
          setUserInput("");
          setStatus("Sắp xếp các chữ cái để tạo thành từ đúng!");
          setStatusType("info");
        }
      }, 1500);
    } else {
      triggerFeedback("wrong");
      setWrongCount((prev) => prev + 1);
      setStatus(`Ôi, chưa đúng đâu. Hãy thử lại nhé! (Tổng: ${score} điểm)`);
      setStatusType("warning");
    }
  }, [
    userInput,
    currentWord,
    score,
    currentIndex,
    playWords.length,
    onComplete,
    triggerFeedback,
    speedTimer,
  ]);

  const handleNext = useCallback(() => {
    if (currentIndex >= playWords.length - 1) {
      setStatus(
        `🌟 Xuất sắc! Bạn đã hoàn thành tất cả các từ! Tổng điểm: ${score} điểm`,
      );
      setStatusType("correct");
      if (!completed) {
        setCompleted(true);
        onComplete?.(score);
      }
      return;
    }
    playGameSfx("levelComplete");
    setCurrentIndex((prev) => prev + 1);
    setUserInput("");
    setStatus("Sắp xếp các chữ cái để tạo thành từ đúng!");
    setStatusType("info");
  }, [completed, currentIndex, onComplete, playWords.length, score]);

  const handleReset = useCallback(() => {
    setPlayWords(shuffleArray(words));
    setCurrentIndex(0);
    setUserInput("");
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
    setStatus("Sắp xếp các chữ cái để tạo thành từ đúng!");
    setStatusType("info");
  }, [words]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const progress = ((currentIndex + 1) / totalWords) * 100;

  if (!currentWord) return null;

  return (
    <SeasonGamePanel game="scramble" maxWidth="5xl">
      <AnswerFeedback feedback={feedback} />
      <header className="text-center">
        <p className={`text-sm uppercase tracking-wide ${ui.label}`}>Word Scramble</p>
        <h2 className={`text-xl sm:text-2xl font-semibold ${ui.heading}`}>{title}</h2>
        <p className={`mt-2 text-base sm:text-lg ${ui.subtext}`}>
          Sắp xếp lại các chữ cái để tạo thành từ đúng!
        </p>
        <SpeedScoreBar
          theme="scramble"
          score={score}
          maxScore={totalWords * SPEED_SCORE_MAX}
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
            <span className={`text-xs sm:text-sm ${ui.label}`}>📚 Từ</span>
            <span className={`text-lg sm:text-xl font-bold ${ui.heading}`}>
              {currentIndex + 1}/{playWords.length}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <span className={`text-xs sm:text-sm ${ui.label}`}>✅ Đúng</span>
            <span className={`text-lg sm:text-xl font-bold ${ui.heading}`}>{correctCount}</span>
          </div>
        </div>
      )}

      <div className={`mt-6 rounded-2xl p-4 sm:p-6 md:p-8 text-center text-white shadow-lg overflow-hidden ${ui.hero}`}>
        <WordVisual
          icon={currentWord.icon}
          emoji={currentWord.emoji}
          alt={currentWord.text}
          className="text-6xl sm:text-7xl mb-4"
          imageClassName="h-20 w-20 sm:h-24 sm:w-24 object-contain mx-auto"
        />
        {currentWord.meaning && (
          <div className="text-lg sm:text-xl bg-white/25 rounded-lg px-4 py-2 inline-block mb-4">
            {currentWord.meaning}
          </div>
        )}
        <div className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-wider break-all px-1 leading-snug">
          {scrambledWord}
        </div>
        <p className="text-base sm:text-lg opacity-90">Sắp xếp lại các chữ cái này!</p>
      </div>

      <div className="mt-6">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Nhập từ của bạn..."
          className={`w-full p-4 sm:p-5 text-center text-2xl sm:text-3xl font-bold border-2 rounded-2xl focus:outline-none ${ui.input}`}
          autoFocus
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleSubmit}
          className={`rounded-xl px-6 py-3 font-bold text-white transition hover:shadow-lg w-full sm:w-auto ${ui.primaryBtn}`}
        >
          ✅ Kiểm tra
        </button>
        <button
          onClick={handleNext}
          className={`rounded-xl px-6 py-3 font-bold text-white transition hover:shadow-lg w-full sm:w-auto ${ui.primaryBtn}`}
        >
          {currentIndex >= playWords.length - 1
            ? "🏁 Hoàn thành"
            : "➡️ Từ tiếp theo"}
        </button>
        <button
          onClick={handleReset}
          className={`rounded-xl px-6 py-3 font-bold text-white transition hover:shadow-lg w-full sm:w-auto bg-gray-500 hover:bg-gray-600`}
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
        game="scramble"
        score={score}
        correctCount={correctCount}
        wrongCount={wrongCount}
        totalCount={playWords.length}
        onPlayAgain={handleReset}
        onChooseOtherGame={onChooseOtherGame}
      />
    </SeasonGamePanel>
  );
}


