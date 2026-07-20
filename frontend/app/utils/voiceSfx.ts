import { getSfxVolumeMultiplier } from "@/app/components/audio/sfxSettings";

export type VoiceSfxType = "correct" | "wrong";

const VOICE_SRC: Record<VoiceSfxType, string> = {
  correct: "/audio/voice/voice-correct.mp3",
  wrong: "/audio/voice/voice-wrong.mp3",
};

let activeVoice: HTMLAudioElement | null = null;

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
