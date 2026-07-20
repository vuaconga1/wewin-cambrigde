/**
 * Kid-friendly game SFX — synthesized via Web Audio API (no external files).
 * Matches the bubble-click style used in clickSound.tsx.
 */

import { getSfxVolumeMultiplier } from "@/app/components/audio/sfxSettings";
import { playVoiceSfx } from "@/app/utils/voiceSfx";

export type GameSfxType =
  | "correct"
  | "wrong"
  | "celebration"
  | "levelComplete"
  | "gameComplete"
  | "popupOpen";

type ToneOpts = {
  frequency: number;
  start: number;
  duration: number;
  volume?: number;
  type?: OscillatorType;
  detune?: number;
  freqEnd?: number;
};

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;

  if (!sharedCtx) sharedCtx = new Ctor();
  if (sharedCtx.state === "suspended") void sharedCtx.resume();
  return sharedCtx;
}

type PlayerFn = (ctx: AudioContext, now: number, scale: number) => void;

function playTone(ctx: AudioContext, opts: ToneOpts, scale: number) {
  const {
    frequency,
    start,
    duration,
    volume = 0.2,
    type = "sine",
    detune = 0,
    freqEnd,
  } = opts;

  const scaledVolume = volume * scale;
  if (scaledVolume <= 0.0001) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(freqEnd, 1),
      start + duration,
    );
  }
  osc.detune.setValueAtTime(detune, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(scaledVolume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function playCorrect(ctx: AudioContext, now: number, scale: number) {
  playTone(ctx, { frequency: 523.25, start: now, duration: 0.12, volume: 0.18, type: "triangle" }, scale);
  playTone(ctx, { frequency: 659.25, start: now + 0.1, duration: 0.12, volume: 0.2, type: "triangle" }, scale);
  playTone(ctx, { frequency: 783.99, start: now + 0.2, duration: 0.18, volume: 0.22, type: "triangle" }, scale);
  playTone(ctx, { frequency: 1046.5, start: now + 0.32, duration: 0.22, volume: 0.16, type: "sine" }, scale);
}

function playWrong(ctx: AudioContext, now: number, scale: number) {
  playTone(ctx, { frequency: 392, start: now, duration: 0.16, volume: 0.16, type: "sine" }, scale);
  playTone(ctx, { frequency: 311.13, start: now + 0.14, duration: 0.22, volume: 0.14, type: "sine" }, scale);
  playTone(ctx, { frequency: 261.63, start: now + 0.28, duration: 0.2, volume: 0.1, type: "triangle" }, scale);
}

/** Bouncy pop khi chữ "Correct!" / "Great!" nhảy lên màn hình */
function playCelebration(ctx: AudioContext, now: number, scale: number) {
  playTone(ctx, {
    frequency: 280,
    freqEnd: 920,
    start: now,
    duration: 0.1,
    volume: 0.14,
    type: "sine",
  }, scale);
  playTone(ctx, { frequency: 880, start: now + 0.06, duration: 0.1, volume: 0.12, type: "triangle" }, scale);
  playTone(ctx, { frequency: 1174.66, start: now + 0.14, duration: 0.16, volume: 0.18, type: "triangle" }, scale);
  playTone(ctx, { frequency: 1567.98, start: now + 0.24, duration: 0.2, volume: 0.14, type: "sine" }, scale);
}

/** Qua màn / qua round */
function playLevelComplete(ctx: AudioContext, now: number, scale: number) {
  playTone(ctx, { frequency: 659.25, start: now, duration: 0.14, volume: 0.18, type: "triangle" }, scale);
  playTone(ctx, { frequency: 987.77, start: now + 0.12, duration: 0.2, volume: 0.2, type: "triangle" }, scale);
  playTone(ctx, {
    frequency: 600,
    freqEnd: 1200,
    start: now + 0.08,
    duration: 0.12,
    volume: 0.08,
    type: "sine",
  }, scale);
}

/** Popup tổng kết / chúc mừng hoàn thành game */
function playGameComplete(ctx: AudioContext, now: number, scale: number) {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, i) => {
    playTone(ctx, {
      frequency: freq,
      start: now + i * 0.13,
      duration: 0.28,
      volume: 0.17 + i * 0.015,
      type: i < 3 ? "triangle" : "sine",
    }, scale);
  });
  playTone(ctx, {
    frequency: 400,
    freqEnd: 1600,
    start: now + 0.55,
    duration: 0.35,
    volume: 0.1,
    type: "sine",
  }, scale);
}

/** Mở popup nhẹ */
function playPopupOpen(ctx: AudioContext, now: number, scale: number) {
  playTone(ctx, {
    frequency: 520,
    freqEnd: 780,
    start: now,
    duration: 0.08,
    volume: 0.08,
    type: "sine",
  }, scale);
  playTone(ctx, { frequency: 987.77, start: now + 0.06, duration: 0.14, volume: 0.12, type: "triangle" }, scale);
}

const PLAYERS: Record<GameSfxType, PlayerFn> = {
  correct: playCorrect,
  wrong: playWrong,
  celebration: playCelebration,
  levelComplete: playLevelComplete,
  gameComplete: playGameComplete,
  popupOpen: playPopupOpen,
};

/** Phát hiệu ứng âm thanh game. Im lặng nếu trình duyệt chặn AudioContext. */
export function playGameSfx(type: GameSfxType) {
  const sfxScale = getSfxVolumeMultiplier();
  if (sfxScale <= 0) return;

  if (type === "celebration" || type === "correct") {
    playVoiceSfx("correct");
    return;
  }

  if (type === "wrong") {
    playVoiceSfx("wrong");
    return;
  }

  const ctx = getContext();
  if (!ctx) return;

  try {
    PLAYERS[type](ctx, ctx.currentTime, sfxScale);
  } catch {
    // Autoplay policy / unsupported
  }
}
