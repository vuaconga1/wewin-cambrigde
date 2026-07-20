"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PronunciationGameConfig, WordItem } from "@/types/games";
import { AnswerFeedback } from "@/app/components/games/AnswerFeedback";
import { GameSummaryModal } from "@/app/components/games/GameSummaryModal";
import { SpeedScoreBar } from "@/app/components/games/SpeedScoreBar";
import { useAnswerFeedback } from "@/app/components/games/useAnswerFeedback";
import { useSpeedScoreTimer } from "@/app/components/games/useSpeedScoreTimer";
import { shuffleArray } from "@/app/utils/gameWordPool";
import { SPEED_SCORE_MAX } from "@/app/utils/speedScore";
import { playGameSfx } from "@/app/utils/gameSfx";
import { playWordAudio, stopWordAudio } from "@/app/utils/playWordAudio";
import { isPronunciationMatch } from "@/lib/games/pronunciationMatch";
import { WordVisual } from "@/app/components/games/WordVisual";
import {
  SeasonGamePanel,
  useGameSeasonTheme,
} from "@/app/components/games/forest-background";

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
  const { ui } = useGameSeasonTheme("speak");
  const [playWords, setPlayWords] = useState<WordItem[]>(words);
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
  const isRecordingRef = useRef(false);
  const currentWordRef = useRef<WordItem | undefined>(undefined);
  const [isSupported, setIsSupported] = useState(false);
  const { feedback, trigger: triggerFeedback } = useAnswerFeedback();
  const speedTimer = useSpeedScoreTimer();
  const [completed, setCompleted] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);


  useEffect(() => {
    setPlayWords(shuffleArray(words));
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
    setStatus("Nhấn 'Nghe từ' để bắt đầu nhé! 🎧");
    setStatusType("info");
  }, [words]);

  const currentWord = playWords[currentIndex];
  const progress = useMemo(
    () => ((currentIndex + 1) / Math.max(playWords.length, 1)) * 100,
    [currentIndex, playWords.length],
  );

  useEffect(() => {
    speedTimer.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on new word
  }, [currentIndex]);

  useEffect(() => {
    currentWordRef.current = currentWord;
  }, [currentWord]);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        ("webkitSpeechRecognition" in window || "SpeechRecognition" in window),
    );
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
  }, []);

  const checkPronunciation = useCallback(
    (transcript: string, correctWord: string) => {
      const isCorrect = isPronunciationMatch(transcript, correctWord);

      if (isCorrect) {
        triggerFeedback("correct");
        const pointsEarned = speedTimer.claimScore();
        const nextScore = score + pointsEarned;
        setScore((prev) => prev + pointsEarned);
        setCorrectCount((prev) => prev + 1);
        setStatus(`🎉 Tuyệt vời! +${pointsEarned} điểm (Tổng: ${nextScore} điểm)`);
        setStatusType("correct");
      } else {
        triggerFeedback("wrong");
        speedTimer.reset();
        setWrongCount((prev) => prev + 1);
        setStatus(`Bạn nói "${transcript}". Thử lại nhé! 💪 (Tổng: ${score} điểm)`);
        setStatusType("warning");
      }
    },
    [score, triggerFeedback, speedTimer],
  );

  const checkPronunciationRef = useRef(checkPronunciation);
  checkPronunciationRef.current = checkPronunciation;

  const createRecognition = useCallback((): SpeechRecognition | null => {
    if (typeof window === "undefined") return null;
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isRecordingRef.current = true;
      setIsRecording(true);
      setStatus("Hãy đọc to và rõ ràng nhé! 🗣️");
      setStatusType("info");
    };

    recognition.onresult = (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => {
      const transcript = event.results[0]?.[0]?.transcript?.toLowerCase().trim();
      const word = currentWordRef.current?.text;
      if (transcript && word) {
        checkPronunciationRef.current(transcript, word);
      }
    };

    recognition.onerror = (event: { error?: string }) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        setStatus("Chưa nghe thấy giọng nói. Bạn thử đọc to hơn nhé!");
      } else if (event.error === "not-allowed") {
        setStatus("Hãy cho phép micro trong Cài đặt Safari để ghi âm.");
      } else {
        setStatus("Không nghe rõ. Bạn thử lại nhé!");
      }
      setStatusType("warning");
      stopRecording();
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      stopRecording();
    };

    return recognition;
  }, [stopRecording]);

  const ensureMicrophoneAccess = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      setStatus("Hãy cho phép micro để ghi âm.");
      setStatusType("warning");
      return false;
    }
  }, []);

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

  const handleRecord = useCallback(async () => {
    if (!isSupported) {
      alert(
        "Trình duyệt của bạn chưa hỗ trợ ghi âm. Hãy dùng Chrome hoặc Edge nhé!",
      );
      return;
    }

    if (isSpeaking) {
      setStatus("Đợi phát âm xong rồi ghi nhé! ⏳");
      return;
    }

    if (isRecordingRef.current && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    stopWordAudio();

    const hasMic = await ensureMicrophoneAccess();
    if (!hasMic) return;

    const recognition = createRecognition();
    if (!recognition) {
      setStatus("Không thể khởi tạo ghi âm. Bạn thử lại nhé!");
      setStatusType("warning");
      return;
    }

    recognitionRef.current = recognition;
    speedTimer.start();

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setStatus("Không thể bắt đầu ghi âm. Bạn thử lại nhé!");
      setStatusType("warning");
      speedTimer.reset();
      stopRecording();
    }
  }, [
    isSupported,
    isSpeaking,
    ensureMicrophoneAccess,
    createRecognition,
    stopRecording,
    speedTimer,
  ]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      stopWordAudio();
    };
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex >= playWords.length - 1) {
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
    playGameSfx("levelComplete");
    setCurrentIndex((prev) => prev + 1);
    setStatus("Nhấn 'Nghe từ' để tiếp tục học từ mới!");
    setStatusType("info");
  }, [completed, currentIndex, onComplete, score, playWords.length]);

  const handleReset = useCallback(() => {
    setPlayWords(shuffleArray(words));
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStatus("Nhấn 'Nghe từ' để bắt đầu nhé! 🎧");
    setStatusType("info");
    setCompleted(false);
  }, [words]);

  if (!currentWord) return null;

  return (
    <SeasonGamePanel game="speak" maxWidth="5xl">
        <AnswerFeedback feedback={feedback} />
        <header className="text-center">
          <h2 className={`text-xl sm:text-2xl font-semibold ${ui.heading}`}>
            {title}
          </h2>
          <SpeedScoreBar
            theme="speak"
            score={score}
            maxScore={Math.max(playWords.length, 1) * SPEED_SCORE_MAX}
            visible={!completed}
          />
        </header>

        {!isSupported && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-center text-sm sm:text-base text-red-700">
            ⚠️ Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Hãy dùng
            Safari (iOS 14.5+), Chrome hoặc Edge nhé!
          </div>
        )}

        <div className={`mt-4 rounded-lg p-4 text-sm sm:text-base ${ui.statusInfo}`}>
          <p className="font-semibold">📝 Cách chơi:</p>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Nhấn "Nghe từ" để nghe phát âm chuẩn.</li>
            <li>Nhấn "Ghi âm" và đọc theo.</li>
            <li>Nhận phản hồi và chuyển sang từ mới!</li>
          </ol>
        </div>

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

        <div className={`mt-6 rounded-2xl p-6 sm:p-8 text-center text-white shadow-lg ${ui.hero}`}>
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
            className={`rounded-xl px-6 py-3 font-bold text-white transition w-full sm:w-auto ${
              isSpeaking
                ? "bg-gray-400 cursor-not-allowed"
                : ui.primaryBtn
            }`}
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
            onClick={handleNext}
            className={`rounded-xl px-6 py-3 font-bold text-white transition w-full sm:w-auto ${ui.primaryBtn}`}
          >
            {currentIndex >= playWords.length - 1
              ? "🏁 Hoàn thành"
              : "➡️ Từ tiếp theo"}
          </button>
        </div>

        <div
          className={`mt-6 rounded-xl p-4 text-center text-base sm:text-lg font-bold ${
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
          game="speak"
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

