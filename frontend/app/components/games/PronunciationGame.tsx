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
    webkitAudioContext?: typeof AudioContext;
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
  const [recordPhase, setRecordPhase] = useState<
    "idle" | "starting" | "listening" | "processing"
  >("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Nhấn 'Nghe từ' để bắt đầu nhé! 🎧");
  const [statusType, setStatusType] = useState<"info" | "correct" | "warning">(
    "info",
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecordingRef = useRef(false);
  const currentWordRef = useRef<WordItem | undefined>(undefined);
  const promptAudioContextRef = useRef<AudioContext | null>(null);
  const promptSourceRef = useRef<AudioBufferSourceNode | null>(null);
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

  const getPromptAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!promptAudioContextRef.current) {
      promptAudioContextRef.current = new AudioCtor();
    }
    const ctx = promptAudioContextRef.current;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  }, []);

  const stopPromptAudio = useCallback(() => {
    const source = promptSourceRef.current;
    if (!source) return;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // Source may already be stopped.
    }
    promptSourceRef.current = null;
  }, []);

  const buildPromptAudioUrls = useCallback(
    (word: Pick<WordItem, "id" | "audio" | "audioUrl">) => {
      const urls: string[] = [];
      const seen = new Set<string>();

      const add = (url?: string | null) => {
        if (!url) return;
        const normalized = url.startsWith("//") ? `https:${url}` : url;
        if (seen.has(normalized)) return;
        seen.add(normalized);
        urls.push(normalized);
      };

      add(word.audioUrl ?? undefined);
      add(word.audio ?? undefined);

      if (audioContext?.bookType && audioContext?.gameSlug) {
        const base = `/audio/wewin/${audioContext.bookType}/${audioContext.gameSlug}/${word.id.toLowerCase()}`;
        add(`${base}.mp3`);
      }

      return urls;
    },
    [audioContext],
  );

  const playPromptAudio = useCallback(
    async (word: WordItem) => {
      const urls = buildPromptAudioUrls(word);
      if (!urls.length) throw new Error("missing-audio");

      const ctx = getPromptAudioContext();
      if (!ctx) throw new Error("missing-audio-context");

      stopPromptAudio();

      let lastError: unknown = null;
      for (const url of urls) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`audio-http-${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          promptSourceRef.current = source;

          await new Promise<void>((resolve, reject) => {
            source.onended = () => {
              if (promptSourceRef.current === source) {
                promptSourceRef.current = null;
              }
              resolve();
            };
            try {
              source.start(0);
            } catch (error) {
              if (promptSourceRef.current === source) {
                promptSourceRef.current = null;
              }
              reject(error);
            }
          });

          return;
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError ?? new Error("audio-playback-failed");
    },
    [buildPromptAudioUrls, getPromptAudioContext, stopPromptAudio],
  );

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setRecordPhase("idle");
  }, []);

  const beginRecordingUI = useCallback(() => {
    isRecordingRef.current = true;
    setIsRecording(true);
    setRecordPhase("starting");
    setStatus("Đang bật micro... Hãy đọc to từ trên màn hình! 🗣️");
    setStatusType("info");
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
      setRecordPhase("listening");
      setStatus("Đang nghe... Đọc to và rõ ràng nhé! 🗣️");
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
        setStatus(
          "Hãy cho phép micro trong Safari. Sau đó bấm Ghi âm lần nữa nhé!",
        );
      } else {
        setStatus("Không nghe rõ. Bạn thử lại nhé!");
      }
      setStatusType("warning");
      stopRecording();
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (isRecordingRef.current) {
        setRecordPhase("processing");
        setStatus("Đang xử lý giọng nói...");
      }
      stopRecording();
    };

    return recognition;
  }, [stopRecording]);

  const handleRecord = useCallback(() => {
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
      setRecordPhase("processing");
      setStatus("Đang xử lý giọng nói...");
      recognitionRef.current.stop();
      return;
    }

    stopPromptAudio();
    stopWordAudio();
    beginRecordingUI();

    const recognition = createRecognition();
    if (!recognition) {
      setStatus("Không thể khởi tạo ghi âm. Bạn thử lại nhé!");
      setStatusType("warning");
      stopRecording();
      return;
    }

    recognitionRef.current = recognition;
    speedTimer.start();

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setStatus(
        "Không thể bắt đầu ghi âm. Nếu vừa cho phép micro, hãy bấm Ghi âm lần nữa!",
      );
      setStatusType("warning");
      speedTimer.reset();
      stopRecording();
    }
  }, [
    isSupported,
    isSpeaking,
    beginRecordingUI,
    createRecognition,
    stopRecording,
    speedTimer,
  ]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      stopPromptAudio();
      stopWordAudio();
    };
  }, [stopPromptAudio]);

  const handleListen = useCallback(() => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setStatus("Lắng nghe thật kỹ nhé! 👂");
    setStatusType("info");

    void playPromptAudio(currentWord)
      .then(() => {
        setIsSpeaking(false);
        setStatus("Nhấn 'Ghi âm' và đọc theo nào!");
        setStatusType("info");
      })
      .catch(() => {
        setIsSpeaking(false);
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
      });
  }, [audioContext, currentWord, isSpeaking, playPromptAudio]);

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
            <li>Nhấn "Ghi âm" và đọc theo — trên Safari có thể cần bấm 2 lần lần đầu.</li>
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

        {recordPhase !== "idle" && (
          <div
            className="mt-4 rounded-2xl border-2 border-red-400 bg-red-50 px-4 py-4 text-center shadow-md"
            role="status"
            aria-live="polite"
          >
            <p className="text-lg font-bold text-red-700">
              {recordPhase === "starting" && "🎤 Đang bật micro..."}
              {recordPhase === "listening" && "🔴 Đang ghi âm — đọc to nhé!"}
              {recordPhase === "processing" && "⏳ Đang xử lý giọng nói..."}
            </p>
            {recordPhase === "listening" && (
              <p className="mt-1 text-sm text-red-600">
                Bấm &quot;Dừng ghi&quot; bên dưới khi đọc xong
              </p>
            )}
          </div>
        )}

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
            disabled={!isSupported || isSpeaking || recordPhase === "processing"}
            className={`rounded-xl px-6 py-3 font-bold text-white transition ${
              recordPhase === "listening" || recordPhase === "starting"
                ? "bg-red-600 animate-pulse ring-4 ring-red-300"
                : isSpeaking || !isSupported || recordPhase === "processing"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg"
            } w-full sm:w-auto`}
          >
            {recordPhase === "listening" || recordPhase === "starting"
              ? "⏹️ Dừng ghi"
              : recordPhase === "processing"
                ? "⏳ Đang xử lý..."
                : "🎤 Ghi âm"}
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

