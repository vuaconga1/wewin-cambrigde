"use client";

import { useEffect } from "react";

import { getSfxVolumeMultiplier } from "@/app/components/audio/sfxSettings";

const INTERACTIVE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "summary",
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='option']",
  "[aria-pressed]",
  "[aria-selected]",
  "[data-click-sound]",
  ".cursor-pointer",
].join(", ");

let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  const webkitWindow = window as Window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextCtor = window.AudioContext ?? webkitWindow.webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextCtor();
  }

  return sharedAudioContext;
}

export function suspendClickSoundContext() {
  if (sharedAudioContext?.state === "running") {
    void sharedAudioContext.suspend();
  }
}

export function resumeClickSoundContext() {
  if (sharedAudioContext?.state === "suspended") {
    void sharedAudioContext.resume();
  }
}

/** Đóng hẳn context — iOS cần nhả audio session trước SpeechRecognition. */
export function closeClickSoundContext() {
  const ctx = sharedAudioContext;
  sharedAudioContext = null;
  if (!ctx || ctx.state === "closed") return;
  void ctx.close().catch(() => {});
}

function isDisabledInteractive(element: Element) {
  return (
    element.closest("[data-no-click-sound='true']") !== null ||
    element.closest("[aria-disabled='true']") !== null
  );
}

function playBubbleClick() {
  const sfxScale = getSfxVolumeMultiplier();
  if (sfxScale <= 0) return;

  const audioContext = getAudioContext();
  if (!audioContext) return;

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  const now = audioContext.currentTime;
  const output = audioContext.createGain();
  const compressor = audioContext.createDynamicsCompressor();
  const filter = audioContext.createBiquadFilter();
  const oscillator = audioContext.createOscillator();
  const overtone = audioContext.createOscillator();
  const master = audioContext.createGain();
  master.gain.setValueAtTime(sfxScale, now);

  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(300.0, now + 0.004);
  output.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  compressor.threshold.setValueAtTime(-50, now);
  compressor.knee.setValueAtTime(30, now);
  compressor.ratio.setValueAtTime(24, now);
  compressor.attack.setValueAtTime(0.001, now);
  compressor.release.setValueAtTime(0.18, now);

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900 + Math.random() * 700, now);
  filter.Q.setValueAtTime(7, now);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(220 + Math.random() * 160, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    520 + Math.random() * 180,
    now + 0.08,
  );

  overtone.type = "triangle";
  overtone.frequency.setValueAtTime(440 + Math.random() * 120, now);
  overtone.frequency.exponentialRampToValueAtTime(
    820 + Math.random() * 180,
    now + 0.07,
  );
  overtone.detune.setValueAtTime(-12, now);

  oscillator.connect(filter);
  overtone.connect(filter);
  filter.connect(output);
  output.connect(compressor);
  compressor.connect(master);
  master.connect(audioContext.destination);

  oscillator.start(now);
  overtone.start(now + 0.003);
  oscillator.stop(now + 0.18);
  overtone.stop(now + 0.18);
}

function isClickTarget(element: Element) {
  if (element.closest(INTERACTIVE_SELECTOR)) return true;

  return window.getComputedStyle(element).cursor === "pointer";
}

export default function ClickSound() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (interactive && isDisabledInteractive(interactive)) return;

      if (!interactive && !isClickTarget(target)) return;

      playBubbleClick();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}