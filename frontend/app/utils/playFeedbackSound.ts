export type FeedbackSoundType = "correct" | "wrong";

function playTone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume = 0.22,
  type: OscillatorType = "sine",
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Short kid-friendly SFX for Correct! / Wrong! overlays. */
export function playFeedbackSound(type: FeedbackSoundType) {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "correct") {
      // Cheerful ascending arpeggio
      playTone(ctx, 523.25, now, 0.14, 0.2, "triangle"); // C5
      playTone(ctx, 659.25, now + 0.12, 0.14, 0.22, "triangle"); // E5
      playTone(ctx, 783.99, now + 0.24, 0.22, 0.25, "triangle"); // G5
    } else {
      // Soft descending “oops”
      playTone(ctx, 392, now, 0.16, 0.18, "sine"); // G4
      playTone(ctx, 311.13, now + 0.14, 0.22, 0.16, "sine"); // Eb4
    }

    window.setTimeout(() => {
      void ctx.close();
    }, 800);
  } catch {
    // Ignore autoplay / AudioContext errors
  }
}
