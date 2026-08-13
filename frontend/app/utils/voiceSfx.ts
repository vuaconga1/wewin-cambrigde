import { getSfxVolumeMultiplier } from "@/app/components/audio/sfxSettings";

export type VoiceSfxType = "correct" | "wrong";

const VOICE_SRC: Record<VoiceSfxType, string> = {
  correct: "/audio/voice/voice-correct.mp3",
  wrong: "/audio/voice/voice-wrong.mp3",
};

let activeVoice: HTMLAudioElement | null = null;

export function stopVoiceSfx() {
  if (!activeVoice) return;
  const audio = activeVoice;
  activeVoice = null;
  audio.muted = true;
  audio.volume = 0;
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    // ignore
  }
  audio.removeAttribute("src");
  audio.src = "";
  audio.load();
}

/** Giọng trẻ em / nhóm trẻ — dùng cho đúng & sai thay tiếng beep. */
export function playVoiceSfx(type: VoiceSfxType) {
  const volume = getSfxVolumeMultiplier();
  if (volume <= 0 || typeof window === "undefined") return;

  if (activeVoice) {
    activeVoice.pause();
    activeVoice.currentTime = 0;
  }

  const audio = new Audio(VOICE_SRC[type]);
  audio.volume = volume;
  activeVoice = audio;
  void audio.play().catch(() => {});
}
