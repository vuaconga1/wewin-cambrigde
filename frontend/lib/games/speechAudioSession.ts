import {
  readStoredBgmSettings,
  setSpeechAudioHold,
  stopSharedAudio,
  tryStartBgmPlayback,
} from "@/app/components/audio/bgmEngine";
import {
  closeClickSoundContext,
  suspendClickSoundContext,
} from "@/app/components/layouts/clickSound";
import { closeGameSfxContext } from "@/app/utils/gameSfx";
import { stopVoiceSfx } from "@/app/utils/voiceSfx";
import { stopWordAudio } from "@/app/utils/playWordAudio";

let resumeBgmAfterSpeech = false;
let micWarmupDone = false;

/** Mọi trình duyệt trên iPhone/iPad (Safari + Chrome/Firefox/Edge — đều dùng WebKit). */
export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
  return isIosDevice() && isSafari;
}

export function isEmbeddedFrame(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Tạm dừng mọi audio app-level trước khi mở mic (đồng bộ, giữ user gesture).
 * iOS: đóng hẳn Web Audio (không suspend) — suspend hay làm SpeechRecognition aborted.
 */
export function prepareAudioSessionForSpeech() {
  const settings = readStoredBgmSettings();
  resumeBgmAfterSpeech = !settings.muted && settings.volume > 0;
  // iOS: pause() vẫn giữ audio session → SpeechRecognition aborted ngay.
  // Phải unload hẳn HTMLAudioElement (BGM + prompt + SFX).
  setSpeechAudioHold(true);
  stopSharedAudio();
  stopWordAudio();
  stopVoiceSfx();
  releaseWebAudioForSpeech();
}

/** Chỉ nhả Web Audio — không đụng cờ resume BGM. */
export function releaseWebAudioForSpeech() {
  stopWordAudio();
  stopVoiceSfx();
  if (isIosDevice()) {
    closeClickSoundContext();
    closeGameSfxContext();
  } else {
    suspendClickSoundContext();
  }
}

export type MicPermissionResult = "granted" | "denied" | "unsupported";

/**
 * Xin quyền micro rồi giải phóng ngay — KHÔNG giữ MediaStream.
 * Giữ stream sống sẽ xung đột với webkitSpeechRecognition trên iOS Safari.
 */
export async function warmupMicPermission(): Promise<MicPermissionResult> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    micWarmupDone = true;
    return "granted";
  } catch {
    return "denied";
  }
}

export function hasWarmedUpMic(): boolean {
  return micWarmupDone;
}

/** @deprecated Dùng warmupMicPermission — không giữ stream khi nhận diện giọng nói. */
export async function acquireMicStream(): Promise<
  | { status: "granted"; stream: MediaStream }
  | { status: "denied" }
  | { status: "unsupported" }
> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { status: "unsupported" };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return { status: "granted", stream };
  } catch {
    return { status: "denied" };
  }
}

export function releaseMicStream(stream: MediaStream | null | undefined) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

export function restoreAudioSessionAfterSpeech() {
  setSpeechAudioHold(false);
  if (!resumeBgmAfterSpeech) return;
  resumeBgmAfterSpeech = false;
  const settings = readStoredBgmSettings();
  if (!settings.muted && settings.volume > 0) {
    void tryStartBgmPlayback(settings.trackId);
  }
}

export function suspendAudioContext(ctx: AudioContext | null | undefined) {
  if (!ctx || ctx.state !== "running") return;
  void ctx.suspend();
}

export function resumeAudioContext(ctx: AudioContext | null | undefined) {
  if (!ctx || ctx.state !== "suspended") return;
  void ctx.resume();
}
