import {
  pauseSharedAudio,
  readStoredBgmSettings,
  tryStartBgmPlayback,
} from "@/app/components/audio/bgmEngine";
import { stopVoiceSfx } from "@/app/utils/voiceSfx";
import { stopWordAudio } from "@/app/utils/playWordAudio";

let resumeBgmAfterSpeech = false;

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
  return isIOS && isSafari;
}

export function isEmbeddedFrame(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Tạm dừng mọi audio app-level trước khi mở mic (đồng bộ, giữ user gesture). */
export function prepareAudioSessionForSpeech() {
  const settings = readStoredBgmSettings();
  resumeBgmAfterSpeech = !settings.muted && settings.volume > 0;
  pauseSharedAudio();
  stopWordAudio();
  stopVoiceSfx();
}

/** iOS Safari: xin quyền micro trước khi SpeechRecognition.start(). */
export async function ensureMicPermission(): Promise<"granted" | "denied" | "unsupported"> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch {
    return "denied";
  }
}

export function restoreAudioSessionAfterSpeech() {
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
