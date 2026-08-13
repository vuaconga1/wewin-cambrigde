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
import { playGameSfx, resumeGameSfxContext, suspendGameSfxContext } from "@/app/utils/gameSfx";
import { playWordAudio, stopWordAudio } from "@/app/utils/playWordAudio";
import { resumeClickSoundContext } from "@/app/components/layouts/clickSound";
import { isPronunciationMatch } from "@/lib/games/pronunciationMatch";
import {
  hasWarmedUpMic,
  isEmbeddedFrame,
  isIosDevice,
  prepareAudioSessionForSpeech,
  releaseWebAudioForSpeech,
  restoreAudioSessionAfterSpeech,
  resumeAudioContext,
  suspendAudioContext,
  warmupMicPermission,
} from "@/lib/games/speechAudioSession";
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
  maxAlternatives?: number;
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
  /** Tăng mỗi lần start mới — bỏ qua onend/onerror của instance cũ. */
  const recognitionGenRef = useRef(0);
  const isRecordingRef = useRef(false);
  /** User muốn giữ mic mở (đến khi có kết quả hoặc bấm Dừng). */
  const wantListeningRef = useRef(false);
  /** Khóa đồng bộ chống touch+click double-fire trên iPhone (gây aborted). */
  const recordGestureLockRef = useRef(false);
  const recordGestureLockTimerRef = useRef<number | null>(null);
  /** Touch đã xử lý ở pointerdown — bỏ qua click tương thích của iOS. */
  const recordHandledByPointerRef = useRef(false);
  /** Soft-end (no-speech / aborted) → restart thay vì dừng UI. */
  const softRestartRef = useRef(false);
  const softRestartCountRef = useRef(0);
  const lastErrorRef = useRef<string | null>(null);
  const gotResultRef = useRef(false);
  /** Đã từng nhận onstart trong phiên ghi hiện tại. */
  const sessionStartedRef = useRef(false);
  /** User chủ động bấm Dừng — tránh hiện lỗi aborted. */
  const userStoppedRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const startRecognitionRef = useRef<() => void>(() => {});
  const currentWordRef = useRef<WordItem | undefined>(undefined);
  const promptAudioContextRef = useRef<AudioContext | null>(null);
  const promptSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { feedback, trigger: triggerFeedback } = useAnswerFeedback();
  const speedTimer = useSpeedScoreTimer();
  const [completed, setCompleted] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [micDebug, setMicDebug] = useState<string | null>(null);
  /** Mọi browser trên iPhone dùng WebKit — cần workaround speech giống Safari. */
  const iosDevice = useMemo(
    () => (typeof window !== "undefined" ? isIosDevice() : false),
    [],
  );
  const embeddedFrame = useMemo(
    () => (typeof window !== "undefined" ? isEmbeddedFrame() : false),
    [],
  );


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

  /** Chỉ Web Speech API (SpeechRecognition / webkitSpeechRecognition). */
  const hasSpeechRecognition = useMemo(
    () =>
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window),
    [],
  );

  useEffect(() => {
    setIsSupported(hasSpeechRecognition);
  }, [hasSpeechRecognition]);

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

  /** Đóng hẳn AudioContext phát âm — để tránh cướp audio session khiến Safari aborted. */
  const releasePromptAudioContext = useCallback(() => {
    stopPromptAudio();
    const ctx = promptAudioContextRef.current;
    if (!ctx) return;
    promptAudioContextRef.current = null;
    void ctx.close().catch(() => {});
  }, [stopPromptAudio]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current == null) return;
    window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;
  }, []);

  const clearGestureLockTimer = useCallback(() => {
    if (recordGestureLockTimerRef.current == null) return;
    window.clearTimeout(recordGestureLockTimerRef.current);
    recordGestureLockTimerRef.current = null;
  }, []);

  const armRecordGestureLock = useCallback(() => {
    recordGestureLockRef.current = true;
    clearGestureLockTimer();
    // iOS phát click tương thích ~300ms sau touch → nút đã đổi thành "Dừng ghi".
    recordGestureLockTimerRef.current = window.setTimeout(() => {
      recordGestureLockTimerRef.current = null;
      recordGestureLockRef.current = false;
    }, 550);
  }, [clearGestureLockTimer]);

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
    wantListeningRef.current = false;
    softRestartRef.current = false;
    lastErrorRef.current = null;
    isRecordingRef.current = false;
    setIsRecording(false);
    setRecordPhase("idle");
  }, []);

  const finishSpeechSession = useCallback(() => {
    // iOS: giữ audio session trống đến khi rời game — đừng bật lại BGM/WebAudio
    // giữa các lần Ghi âm (HTMLAudio + AudioContext làm recognition aborted ngay).
    if (iosDevice) {
      releaseWebAudioForSpeech();
      return;
    }
    restoreAudioSessionAfterSpeech();
    resumeAudioContext(promptAudioContextRef.current);
    resumeGameSfxContext();
    resumeClickSoundContext();
  }, [iosDevice]);

  const beginRecordingUI = useCallback(() => {
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

  /** Soft-end retries — chỉ cho no-speech sau khi onstart thành công. */
  const MAX_NO_SPEECH_RESTARTS = 8;

  const scheduleSoftRestart = useCallback(
    (delayMs: number) => {
      clearRestartTimer();
      softRestartCountRef.current += 1;
      setMicDebug(
        (prev) =>
          `${prev ?? "onend"} → restart #${softRestartCountRef.current} (${delayMs}ms)`,
      );
      setRecordPhase("listening");
      setStatus("Đang nghe... Đọc to và rõ ràng nhé! 🗣️");
      setStatusType("info");
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null;
        if (!wantListeningRef.current || gotResultRef.current) return;
        startRecognitionRef.current();
      }, delayMs);
    },
    [clearRestartTimer],
  );

  const createRecognition = useCallback((gen: number): SpeechRecognition | null => {
    if (typeof window === "undefined") return null;
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    // iOS WebKit: continuous=true thường aborted ngay. Dùng false + restart khi no-speech.
    recognition.continuous = false;
    recognition.interimResults = iosDevice;
    try {
      recognition.maxAlternatives = 1;
    } catch {
      // ignore
    }

    recognition.onstart = () => {
      if (gen !== recognitionGenRef.current) return;
      isRecordingRef.current = true;
      sessionStartedRef.current = true;
      setIsRecording(true);
      setRecordPhase("listening");
      setMicDebug(
        softRestartCountRef.current > 0
          ? `onstart (retry #${softRestartCountRef.current})`
          : "onstart",
      );
      if (softRestartCountRef.current === 0) {
        speedTimer.start();
      }
      setStatus("Đang nghe... Đọc to và rõ ràng nhé! 🗣️");
      setStatusType("info");
    };

    recognition.onresult = (event: {
      resultIndex: number;
      results: {
        length: number;
        [index: number]: {
          isFinal: boolean;
          [altIndex: number]: { transcript: string };
        };
      };
    }) => {
      if (gen !== recognitionGenRef.current) return;
      let transcript = "";
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i]?.[0]?.transcript?.toLowerCase().trim();
        if (!piece) continue;
        transcript = piece;
        isFinal = event.results[i].isFinal;
      }

      const word = currentWordRef.current?.text;
      if (!transcript || !word) return;

      // iOS: interim chỉ chấp nhận khi đã khớp từ — tránh cắt sớm vì nửa từ.
      if (!isFinal && iosDevice && !isPronunciationMatch(transcript, word)) {
        setMicDebug(`interim: "${transcript}"`);
        return;
      }

      gotResultRef.current = true;
      wantListeningRef.current = false;
      softRestartRef.current = false;
      clearRestartTimer();
      setMicDebug(`onresult: "${transcript}"`);
      checkPronunciationRef.current(transcript, word);
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };

    recognition.onerror = (event: { error?: string }) => {
      if (gen !== recognitionGenRef.current) return;
      const error = event.error ?? "unknown";
      lastErrorRef.current = error;
      setMicDebug(`onerror: ${error}`);

      // Chỉ no-speech (sau khi đã onstart) mới soft-restart.
      // aborted: restart từ timer trên iOS hầu như luôn abort lại → loop 1→15 vô ích.
      if (
        error === "no-speech" &&
        wantListeningRef.current &&
        !gotResultRef.current &&
        sessionStartedRef.current
      ) {
        softRestartRef.current = true;
        setStatus("Vẫn đang nghe... Hãy đọc to hơn một chút! 🗣️");
        setStatusType("info");
        return;
      }

      if (error === "aborted") {
        // Để onend dọn session — không đánh dấu soft-restart.
        return;
      }

      wantListeningRef.current = false;
      softRestartRef.current = false;
      clearRestartTimer();
      finishSpeechSession();
      if (error === "no-speech") {
        setStatus("Chưa nghe thấy giọng nói. Bạn thử đọc to hơn nhé!");
      } else if (error === "not-allowed") {
        setStatus(
          "Safari chưa cho phép micro. Vào Cài đặt > Safari > Micro và bật cho trang này.",
        );
      } else if (error === "service-not-allowed") {
        setStatus(
          "Safari không cho phép nhận diện giọng nói trong khung nhúng (iframe). Mở game trực tiếp trên trình duyệt.",
        );
      } else if (error === "network") {
        setStatus("Cần kết nối mạng để Safari nhận diện giọng nói.");
      } else {
        setStatus(`Lỗi micro: ${error}. Bạn thử lại nhé!`);
      }
      setStatusType("warning");
      speedTimer.reset();
      stopRecording();
    };

    recognition.onend = () => {
      if (gen !== recognitionGenRef.current) return;
      setMicDebug((prev) => (prev ? `${prev} → onend` : "onend"));
      recognitionRef.current = null;

      const canRestartNoSpeech =
        wantListeningRef.current &&
        !gotResultRef.current &&
        softRestartRef.current &&
        lastErrorRef.current === "no-speech" &&
        sessionStartedRef.current &&
        softRestartCountRef.current < MAX_NO_SPEECH_RESTARTS;

      if (canRestartNoSpeech) {
        softRestartRef.current = false;
        lastErrorRef.current = null;
        // Gọi ngay trong onend — giữ "chuỗi" session Safari tốt hơn setTimeout.
        softRestartCountRef.current += 1;
        setMicDebug(
          (prev) =>
            `${prev ?? "onend"} → no-speech restart #${softRestartCountRef.current}`,
        );
        setRecordPhase("listening");
        setStatus("Đang nghe... Đọc to và rõ ràng nhé! 🗣️");
        setStatusType("info");
        try {
          startRecognitionRef.current();
        } catch {
          scheduleSoftRestart(80);
        }
        return;
      }

      const wasListening = isRecordingRef.current;
      const wasAborted =
        lastErrorRef.current === "aborted" && !userStoppedRef.current;
      const userStopped = userStoppedRef.current;

      wantListeningRef.current = false;
      softRestartRef.current = false;
      clearRestartTimer();
      finishSpeechSession();

      if (gotResultRef.current) {
        // Status đã set bởi checkPronunciation — không ghi đè.
      } else if (wasAborted) {
        setStatus(
          "Trình duyệt hủy micro (xung đột âm thanh). Tắt nhạc nền (🔊), đợi 1 giây rồi bấm Ghi âm lại.",
        );
        setStatusType("warning");
        speedTimer.reset();
      } else if (
        softRestartCountRef.current >= MAX_NO_SPEECH_RESTARTS &&
        !gotResultRef.current
      ) {
        setStatus(
          "Chưa nghe thấy giọng nói. Bấm Ghi âm lại và đọc to ngay khi mic bật!",
        );
        setStatusType("warning");
        speedTimer.reset();
      } else if (userStopped || wasListening) {
        // Dừng khi chưa có transcript — không để kẹt "Đang xử lý...".
        setStatus("Chưa nghe thấy giọng nói. Bấm Ghi âm và đọc to hơn nhé!");
        setStatusType("warning");
        speedTimer.reset();
      } else {
        setStatus(
          "Ghi âm bị hủy sớm. Hãy tắt nhạc nền (🔊) rồi bấm Ghi âm lại.",
        );
        setStatusType("warning");
        speedTimer.reset();
      }
      userStoppedRef.current = false;
      stopRecording();
    };

    return recognition;
  }, [
    iosDevice,
    speedTimer,
    stopRecording,
    finishSpeechSession,
    clearRestartTimer,
    scheduleSoftRestart,
  ]);

  const startRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }

    const gen = recognitionGenRef.current + 1;
    recognitionGenRef.current = gen;
    const recognition = createRecognition(gen);
    if (!recognition) {
      setStatus("Không thể khởi tạo ghi âm. Bạn thử lại nhé!");
      setStatusType("warning");
      stopRecording();
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      // InvalidStateError khi no-speech restart quá sớm.
      if (
        wantListeningRef.current &&
        sessionStartedRef.current &&
        softRestartCountRef.current < MAX_NO_SPEECH_RESTARTS
      ) {
        softRestartRef.current = true;
        lastErrorRef.current = "no-speech";
        scheduleSoftRestart(150);
        return;
      }
      finishSpeechSession();
      setMicDebug(
        `start() threw: ${error instanceof Error ? error.message : "unknown"}`,
      );
      setStatus(
        "Không thể bắt đầu ghi âm. Nếu vừa cho phép micro, hãy bấm Ghi âm lần nữa!",
      );
      setStatusType("warning");
      speedTimer.reset();
      stopRecording();
    }
  }, [
    createRecognition,
    stopRecording,
    speedTimer,
    finishSpeechSession,
    scheduleSoftRestart,
  ]);

  startRecognitionRef.current = startRecognition;

  const handleRecord = useCallback(async () => {
    if (!isSupported) {
      alert(
        "Trình duyệt chưa hỗ trợ Web Speech API. Hãy dùng Safari (iPhone), Chrome hoặc Edge nhé!",
      );
      return;
    }

    if (isSpeaking) {
      setStatus("Đợi phát âm xong rồi ghi nhé! ⏳");
      return;
    }

    // iOS: click ma sau touch phải bị bỏ qua TRƯỚC nhánh "Dừng ghi".
    if (recordGestureLockRef.current) return;

    // Đang nghe thật sự → bấm lần nữa = dừng.
    if (isRecordingRef.current || recordPhase === "listening") {
      userStoppedRef.current = true;
      wantListeningRef.current = false;
      softRestartRef.current = false;
      clearRestartTimer();
      armRecordGestureLock();

      if (recognitionRef.current) {
        setRecordPhase("processing");
        setStatus("Đang xử lý giọng nói...");
        try {
          recognitionRef.current.stop();
        } catch {
          finishSpeechSession();
          setStatus("Chưa nghe thấy giọng nói. Bấm Ghi âm và đọc to hơn nhé!");
          setStatusType("warning");
          speedTimer.reset();
          stopRecording();
        }
      } else {
        finishSpeechSession();
        setStatus("Chưa nghe thấy giọng nói. Bấm Ghi âm và đọc to hơn nhé!");
        setStatusType("warning");
        speedTimer.reset();
        stopRecording();
      }
      return;
    }

    // Đang khởi động — bỏ qua touch+click trùng.
    if (
      wantListeningRef.current ||
      recordPhase === "starting" ||
      recordPhase === "processing"
    ) {
      return;
    }

    if (recordPhase !== "idle") return;

    armRecordGestureLock();
    wantListeningRef.current = true;
    softRestartRef.current = false;
    softRestartCountRef.current = 0;
    gotResultRef.current = false;
    sessionStartedRef.current = false;
    userStoppedRef.current = false;
    lastErrorRef.current = null;
    clearRestartTimer();

    stopPromptAudio();
    stopWordAudio();
    releasePromptAudioContext();
    prepareAudioSessionForSpeech();
    if (!iosDevice) {
      suspendGameSfxContext();
      suspendAudioContext(promptAudioContextRef.current);
    }

    beginRecordingUI();

    if (iosDevice && !hasWarmedUpMic()) {
      setMicDebug("warming up mic…");
      const result = await warmupMicPermission();
      if (!wantListeningRef.current) return;
      if (result === "denied") {
        finishSpeechSession();
        setStatus(
          "Safari chưa cho phép micro. Vào Cài đặt > Safari > Micro và bật cho trang này.",
        );
        setStatusType("warning");
        stopRecording();
        return;
      }
      setMicDebug("mic warmup ok → recognition.start()");
      startRecognition();
      return;
    }

    setMicDebug("starting → recognition.start()");
    startRecognition();
  }, [
    isSupported,
    isSpeaking,
    recordPhase,
    iosDevice,
    beginRecordingUI,
    startRecognition,
    stopPromptAudio,
    releasePromptAudioContext,
    finishSpeechSession,
    stopRecording,
    clearRestartTimer,
    armRecordGestureLock,
    speedTimer,
  ]);

  useEffect(() => {
    if (!iosDevice) return;
    prepareAudioSessionForSpeech();
    return () => {
      restoreAudioSessionAfterSpeech();
    };
  }, [iosDevice]);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      softRestartRef.current = false;
      recordGestureLockRef.current = false;
      recognitionGenRef.current += 1;
      if (restartTimerRef.current != null) {
        window.clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      if (recordGestureLockTimerRef.current != null) {
        window.clearTimeout(recordGestureLockTimerRef.current);
        recordGestureLockTimerRef.current = null;
      }
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

    const afterPlay = () => {
      setIsSpeaking(false);
      setStatus("Nhấn 'Ghi âm' và đọc theo nào!");
      setStatusType("info");
      // iOS: nhả Web Audio ngay sau khi nghe xong, trước khi user bấm Ghi âm.
      if (iosDevice) {
        releasePromptAudioContext();
        releaseWebAudioForSpeech();
      }
    };

    const playHtmlAudio = () => {
      playWordAudio(currentWord, audioContext, {
        onStart: () => {
          setIsSpeaking(true);
          setStatus("Lắng nghe thật kỹ nhé! 👂");
          setStatusType("info");
        },
        onEnd: afterPlay,
        onError: () => {
          setIsSpeaking(false);
          setStatus("Chưa có file âm thanh cho từ này.");
          setStatusType("warning");
        },
      });
    };

    const play = () => {
      // iOS: tránh Web Audio cho prompt — AudioContext sống dễ làm SpeechRecognition aborted.
      if (iosDevice) {
        playHtmlAudio();
        return;
      }

      void playPromptAudio(currentWord)
        .then(afterPlay)
        .catch(() => {
          setIsSpeaking(false);
          playHtmlAudio();
        });
    };

    // Warm-up trên gesture "Nghe từ": xin quyền rồi stop track ngay.
    // Phải xong trước khi phát âm để không còn MediaStream khi bấm Ghi âm.
    if (iosDevice && !hasWarmedUpMic()) {
      void warmupMicPermission().then((result) => {
        setMicDebug(`mic-warmup: ${result}`);
        if (result === "denied") {
          setIsSpeaking(false);
          setStatus(
            "Safari chưa cho phép micro. Vào Cài đặt > Safari > Micro và bật cho trang này.",
          );
          setStatusType("warning");
          return;
        }
        play();
      });
      return;
    }

    play();
  }, [
    audioContext,
    currentWord,
    iosDevice,
    isSpeaking,
    playPromptAudio,
    releasePromptAudioContext,
  ]);

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
    if (!iosDevice) {
      playGameSfx("levelComplete");
    }
    setCurrentIndex((prev) => prev + 1);
    setStatus("Nhấn 'Nghe từ' để tiếp tục học từ mới!");
    setStatusType("info");
  }, [completed, currentIndex, onComplete, score, playWords.length, iosDevice]);

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
            ⚠️ Trình duyệt không hỗ trợ Web Speech API. Hãy dùng Safari (iPhone),
            Chrome hoặc Edge nhé!
          </div>
        )}

        {embeddedFrame && (
          <div className="mt-4 rounded-lg bg-amber-100 p-3 text-center text-sm sm:text-base text-amber-900">
            ⚠️ Game đang chạy trong iframe. iPhone có thể không cho micro —
            hãy mở link game trực tiếp trên Safari.
          </div>
        )}

        <div className={`mt-4 rounded-lg p-4 text-sm sm:text-base ${ui.statusInfo}`}>
          <p className="font-semibold">📝 Cách chơi:</p>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Nhấn &quot;Nghe từ&quot; để nghe phát âm chuẩn.</li>
            <li>
              Nhấn &quot;Ghi âm&quot; và đọc theo — dùng Web Speech trên Safari
              (iPhone) hoặc Chrome/Edge.
            </li>
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

        <div
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
          data-no-click-sound="true"
        >
          <button
            onClick={handleListen}
            disabled={isSpeaking}
            data-no-click-sound="true"
            className={`rounded-xl px-6 py-3 font-bold text-white transition w-full sm:w-auto ${
              isSpeaking
                ? "bg-gray-400 cursor-not-allowed"
                : ui.primaryBtn
            }`}
          >
            🔊 Nghe từ
          </button>
          <button
            onPointerDown={(event) => {
              if (event.pointerType !== "touch" && event.pointerType !== "pen") {
                return;
              }
              event.preventDefault();
              recordHandledByPointerRef.current = true;
              void handleRecord();
            }}
            onClick={() => {
              if (recordHandledByPointerRef.current) {
                recordHandledByPointerRef.current = false;
                return;
              }
              void handleRecord();
            }}
            disabled={
              !isSupported ||
              isSpeaking ||
              recordPhase === "processing" ||
              recordPhase === "starting"
            }
            data-no-click-sound="true"
            className={`touch-manipulation rounded-xl px-6 py-3 font-bold text-white transition ${
              recordPhase === "listening"
                ? "bg-red-600 animate-pulse ring-4 ring-red-300"
                : isSpeaking || !isSupported || recordPhase !== "idle"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg"
            } w-full sm:w-auto`}
          >
            {recordPhase === "listening"
              ? "⏹️ Dừng ghi"
              : recordPhase === "starting"
                ? "🎤 Đang bật micro..."
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

        {micDebug ? (
          <p className="mt-2 text-center font-mono text-xs text-slate-500">
            Mic debug: {micDebug}
          </p>
        ) : null}

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

