"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PronunciationGameConfig } from "@/types/games";
import { GameSummaryModal } from "@/app/components/games/GameSummaryModal";
import { playWordAudio } from "@/app/utils/playWordAudio";
import { WordVisual } from "@/app/components/games/WordVisual";

type Props = PronunciationGameConfig & {
  onComplete?: (score: number) => void;
  onChooseOtherGame?: () => void;
};

type SpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function PronunciationGame({
  title,
  words,
  audioContext,
  onComplete,
  onChooseOtherGame,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Nhấn 'Nghe từ' để bắt đầu nhé! 🎧");
  const [statusType, setStatusType] = useState<"info" | "correct" | "warning">(
    "info",
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const currentWord = words[currentIndex];
  const progress = useMemo(
    () => ((currentIndex + 1) / words.length) * 100,
    [currentIndex, words.length],
  );

  useEffect(() => {
    // Kiểm tra hỗ trợ Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsSupported(true);
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setStatus("Hãy đọc to và rõ ràng nhé! 🗣️");
        setStatusType("info");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        checkPronunciation(transcript, currentWord.text);
      };

      recognition.onerror = () => {
        setStatus("Không nghe rõ. Bạn thử lại nhé!");
        setStatusType("warning");
        stopRecording();
      };

      recognition.onend = () => {
        stopRecording();
      };

      recognitionRef.current = recognition;
    }
  }, [currentWord.text]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const calculateSimilarity = useCallback((a: string, b: string): number => {
    if (!a || !b) return 0;
    if (a === b) return 1;

    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    const longerLength = longer.length;

    // Levenshtein distance
    const matrix: number[][] = Array.from({ length: shorter.length + 1 }, () =>
      Array(longer.length + 1).fill(0),
    );

    for (let i = 0; i <= shorter.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= longer.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= shorter.length; i++) {
      for (let j = 1; j <= longer.length; j++) {
        if (shorter.charAt(i - 1) === longer.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    const distance = matrix[shorter.length][longer.length];
    return (longerLength - distance) / longerLength;
  }, []);

  const checkPronunciation = useCallback(
    (transcript: string, correctWord: string) => {
      const cleanTranscript = transcript.replace(/[^\w\s]/g, "").trim();
      const cleanCorrect = correctWord.toLowerCase();
      const similarity = calculateSimilarity(cleanTranscript, cleanCorrect);
      const contains =
        cleanTranscript.includes(cleanCorrect) ||
        cleanCorrect.includes(cleanTranscript);
      const isPerfect = cleanTranscript === cleanCorrect;
      const isVeryGood = contains || similarity >= 0.8;
      const isGood = similarity >= 0.6;
      const isCorrect = isPerfect || isVeryGood || isGood;

      if (isCorrect) {
        let pointsEarned = 0;
        if (isPerfect) {
          pointsEarned = 15;
          setStatus(
            `🎉 Hoàn hảo! Phát âm chính xác 100%! +15 điểm (Tổng: ${score + pointsEarned} điểm)`,
          );
        } else if (isVeryGood) {
          pointsEarned = 12;
          setStatus(
            `🌟 Rất tốt! Phát âm gần như hoàn hảo! +12 điểm (Tổng: ${score + pointsEarned} điểm)`,
          );
        } else {
          pointsEarned = 10;
          setStatus(
            `👍 Tốt! Phát âm đúng! +10 điểm (Tổng: ${score + pointsEarned} điểm)`,
          );
        }
        setScore((prev) => prev + pointsEarned);
        setCorrectCount((prev) => prev + 1);
        setStatusType("correct");
      } else {
        setScore((prev) => Math.max(0, prev - 3));
        setWrongCount((prev) => prev + 1);
        setStatus(
          `Bạn nói "${transcript}". Thử lại nhé! 💪 -3 điểm (Tổng: ${Math.max(0, score - 3)} điểm)`,
        );
        setStatusType("warning");
      }
    },
    [score, calculateSimilarity],
  );

  const handleListen = useCallback(() => {
    if (isSpeaking) return;

    playWordAudio(currentWord, audioContext, {
      onStart: () => {
        setIsSpeaking(true);
        setStatus("Lắng nghe thật kỹ nhé! 👂");
        setStatusType("info");
      },
      onEnd: () => {
        setIsSpeaking(false);
        setStatus("Nhấn 'Ghi âm' và đọc theo nào!");
        setStatusType("info");
      },
      onError: () => {
        setIsSpeaking(false);
        setStatus("Chưa có file âm thanh cho từ này.");
        setStatusType("warning");
      },
    });
  }, [audioContext, currentWord, isSpeaking]);

  const handleRecord = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      alert(
        "Trình duyệt của bạn chưa hỗ trợ ghi âm. Hãy dùng Chrome hoặc Edge nhé!",
      );
      return;
    }

    if (isSpeaking) {
      setStatus("Đợi phát âm xong rồi ghi nhé! ⏳");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        setStatus("Không thể bắt đầu ghi âm. Bạn thử lại nhé!");
        setStatusType("warning");
        stopRecording();
      }
    }
  }, [isSupported, isSpeaking, isRecording, stopRecording]);

  const handleNext = useCallback(() => {
    if (currentIndex >= words.length - 1) {
      setStatus(
        `🎉 Xuất sắc! Bạn đã hoàn thành tất cả các từ! Tổng điểm: ${score} điểm`,
      );
      setStatusType("correct");
      if (!completed) {
        setCompleted(true);
        onComplete?.(score);
      }
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setStatus("Nhấn 'Nghe từ' để tiếp tục học từ mới!");
    setStatusType("info");
  }, [completed, currentIndex, onComplete, score, words.length]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStatus("Nhấn 'Nghe từ' để bắt đầu nhé! 🎧");
    setStatusType("info");
    setCompleted(false);
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-cyan-100 bg-fixed py-8 sm:py-10 px-3 sm:px-4 md:px-6">
      <div className="rounded-2xl border border-green-100 bg-white/95 p-4 sm:p-6 shadow-xl max-w-5xl mx-auto">
        <header className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-green-900">
            {title}
          </h2>
        </header>

        {!isSupported && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-center text-sm sm:text-base text-red-700">
            ⚠️ Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Hãy dùng
            Chrome hoặc Edge nhé!
          </div>
        )}

        <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm sm:text-base text-yellow-800">
          <p className="font-semibold">📝 Cách chơi:</p>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Nhấn "Nghe từ" để nghe phát âm chuẩn.</li>
            <li>Nhấn "Ghi âm" và đọc theo.</li>
            <li>Nhận phản hồi và chuyển sang từ mới!</li>
          </ol>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex-1 text-center">
            <div className="text-sm sm:text-base text-green-600">⭐ Điểm</div>
            <div className="text-xl sm:text-2xl font-bold text-green-900">
              {score}
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm sm:text-base text-green-600">📚 Từ</div>
            <div className="text-xl sm:text-2xl font-bold text-green-900">
              {currentIndex + 1}/{words.length}
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm sm:text-base text-green-600">✅ Đúng</div>
            <div className="text-xl sm:text-2xl font-bold text-green-900">
              {correctCount}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 sm:p-8 text-center text-white shadow-lg">
          <WordVisual
            icon={currentWord.icon}
            emoji={currentWord.emoji}
            alt={currentWord.text}
            className="text-5xl sm:text-7xl mb-4"
            imageClassName="h-20 w-20 sm:h-28 sm:w-28 object-contain mx-auto"
          />
          <div className="text-3xl sm:text-4xl font-bold mb-2 capitalize">
            {currentWord.text}
          </div>
          {currentWord.meaning && (
            <div className="text-lg sm:text-xl bg-white/25 rounded-lg px-4 py-2 inline-block">
              {currentWord.meaning}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleListen}
            disabled={isSpeaking}
            className={`rounded-xl px-6 py-3 font-bold text-white transition ${
              isSpeaking
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1057C1] hover:bg-[#1057C1] hover:shadow-lg"
            } w-full sm:w-auto`}
          >
            🔊 Nghe từ
          </button>
          <button
            onClick={handleRecord}
            disabled={!isSupported || isSpeaking}
            className={`rounded-xl px-6 py-3 font-bold text-white transition ${
              isRecording
                ? "bg-red-600 animate-pulse"
                : isSpeaking || !isSupported
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg"
            } w-full sm:w-auto`}
          >
            {isRecording ? "⏹️ Dừng ghi" : "🎤 Ghi âm"}
          </button>
          <button
            onClick={
              currentIndex >= words.length - 1 ? handleReset : handleNext
            }
            className="rounded-xl bg-[#1057C1] px-6 py-3 font-bold text-white transition hover:bg-[#1057C1] hover:shadow-lg w-full sm:w-auto"
          >
            {currentIndex >= words.length - 1
              ? "🔄 Chơi lại"
              : "➡️ Từ tiếp theo"}
          </button>
        </div>

        <div
          className={`mt-6 rounded-xl p-4 text-center text-base sm:text-lg font-bold ${
            statusType === "correct"
              ? "bg-green-100 text-green-800"
              : statusType === "warning"
                ? "bg-orange-100 text-orange-800"
                : "bg-green-100 text-green-800"
          }`}
        >
          {status}
        </div>

        <div className="mt-4 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-300"
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

