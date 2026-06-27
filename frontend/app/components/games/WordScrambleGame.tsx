"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import type { WordScrambleGameConfig } from "@/types/games";
import { GameSummaryModal } from "@/app/components/games/GameSummaryModal";
import { WordVisual } from "@/app/components/games/WordVisual";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState("Sắp xếp các chữ cái để tạo thành từ đúng!");
  const [statusType, setStatusType] = useState<"info" | "correct" | "warning">("info");

  const currentWord = words[currentIndex];

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
    if (!userInput.trim()) {
      setStatus("Hãy nhập từ của bạn!");
      setStatusType("warning");
      return;
    }

    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = currentWord.text.toLowerCase();

    if (userAnswer === correctAnswer) {
      const pointsEarned = 10;
      const nextScore = score + pointsEarned;
      setScore(nextScore);
      setCorrectCount((prev) => prev + 1);
      setStatus(
        `🎉 Tuyệt vời! Bạn đã sắp xếp đúng! +${pointsEarned} điểm (Tổng: ${nextScore} điểm)`,
      );
      setStatusType("correct");

      setTimeout(() => {
        if (currentIndex >= words.length - 1) {
          setStatus(
            `🌟 Xuất sắc! Bạn đã hoàn thành tất cả các từ! Tổng điểm: ${nextScore} điểm`,
          );
          setCompleted(true);
          onComplete?.(nextScore);
        } else {
          setCurrentIndex((prev) => prev + 1);
          setUserInput("");
          setStatus("Sắp xếp các chữ cái để tạo thành từ đúng!");
          setStatusType("info");
        }
      }, 1500);
    } else {
      const nextScore = Math.max(0, score - 2);
      setScore(nextScore);
      setWrongCount((prev) => prev + 1);
      setStatus(
        `Ôi, chưa đúng đâu. Hãy thử lại nhé! -2 điểm (Tổng: ${nextScore} điểm)`,
      );
      setStatusType("warning");
    }
  }, [userInput, currentWord, score, currentIndex, words.length, onComplete]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setUserInput("");
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
    setStatus("Sắp xếp các chữ cái để tạo thành từ đúng!");
    setStatusType("info");
  }, []);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <section className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-fuchsia-100 bg-fixed py-8 sm:py-10 px-3 sm:px-4 md:px-6">
      <div className="rounded-2xl border border-pink-100 bg-white/95 p-4 sm:p-6 shadow-xl max-w-5xl mx-auto">
      <header className="text-center">
        <p className="text-sm uppercase tracking-wide text-pink-400">Word Scramble</p>
        <h2 className="text-xl sm:text-2xl font-semibold text-pink-900">{title}</h2>
        <p className="mt-2 text-base sm:text-lg text-pink-700">
          Sắp xếp lại các chữ cái để tạo thành từ đúng!
        </p>
      </header>

      {showScore && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex-1 text-center">
              <div className="text-base sm:text-lg text-pink-600">⭐ Điểm</div>
              <div className="text-2xl sm:text-3xl font-bold text-pink-900">{score}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-base sm:text-lg text-pink-600">📚 Từ</div>
            <div className="text-2xl sm:text-3xl font-bold text-pink-900">
              {currentIndex + 1}/{words.length}
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-base sm:text-lg text-pink-600">✅ Đúng</div>
            <div className="text-2xl sm:text-3xl font-bold text-pink-900">{correctCount}</div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 sm:p-8 text-center text-white shadow-lg">
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
        <div className="text-4xl sm:text-5xl font-bold mb-4 tracking-wider">
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
          className="w-full p-4 sm:p-5 text-center text-2xl sm:text-3xl font-bold border-2 border-pink-300 rounded-2xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
          autoFocus
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleSubmit}
            className="rounded-xl bg-pink-500 px-6 py-3 font-bold text-white transition hover:bg-pink-600 hover:shadow-lg w-full sm:w-auto"
        >
          ✅ Kiểm tra
        </button>
        <button
          onClick={handleReset}
          className="rounded-xl bg-gray-500 px-6 py-3 font-bold text-white transition hover:bg-gray-600 hover:shadow-lg w-full sm:w-auto"
        >
          🔄 Chơi lại
        </button>
      </div>

      <div
        className={`mt-6 rounded-xl p-4 text-center font-bold text-lg sm:text-xl ${
          statusType === "correct"
            ? "bg-green-100 text-green-800"
            : statusType === "warning"
              ? "bg-orange-100 text-orange-800"
              : "bg-pink-100 text-pink-800"
        }`}
      >
        {status}
      </div>

      <div className="mt-4 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <GameSummaryModal
        open={completed}
        score={score}
        correctCount={correctCount}
        wrongCount={wrongCount}
        totalCount={words.length}
        onPlayAgain={handleReset}
        onChooseOtherGame={onChooseOtherGame}
      />
      </div>
    </section>
  );
}


