import {
  BGM_DEFAULT_SETTINGS,
  BGM_STORAGE_KEY,
  getBgmTrack,
  isBgmTrackId,
  type BgmSettings,
  type BgmTrackId,
} from "./constants";

let sharedAudio: HTMLAudioElement | null = null;
let sharedTrackSrc: string | null = null;
let autoplayBound = false;
const loopBound = new WeakSet<HTMLAudioElement>();

/** Đảm bảo nhạc nền lặp lại khi hết bài (loop + fallback ended). */
function ensureBgmLoop(audio: HTMLAudioElement) {
  audio.loop = true;

  if (loopBound.has(audio)) return;
  loopBound.add(audio);

  const markLoopReady = () => {
    audio.loop = true;
  };
  audio.addEventListener("loadedmetadata", markLoopReady);
  audio.addEventListener("canplaythrough", markLoopReady);

  audio.addEventListener("ended", () => {
    if (audio.muted) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  });
}

function createSharedAudio(src: string) {
  stopSharedAudio();
  sharedAudio = new Audio(src);
  sharedAudio.preload = "auto";
  ensureBgmLoop(sharedAudio);
  sharedTrackSrc = src;
  return sharedAudio;
}

export function getSharedAudio(src: string) {
  if (typeof window === "undefined") return null;

  if (sharedAudio && sharedTrackSrc === src) {
    ensureBgmLoop(sharedAudio);
    return sharedAudio;
  }

  return createSharedAudio(src);
}

export function pauseSharedAudio() {
  sharedAudio?.pause();
}

/** Dừng hẳn — chỉ khi đổi bài hoặc reset player. */
export function stopSharedAudio() {
  if (!sharedAudio) return;
  sharedAudio.pause();
  sharedAudio.currentTime = 0;
  sharedAudio.removeAttribute("src");
  sharedAudio.load();
  sharedAudio = null;
  sharedTrackSrc = null;
}

export function readStoredBgmSettings(): BgmSettings {
  if (typeof window === "undefined") return BGM_DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(BGM_STORAGE_KEY);
    if (!raw) return BGM_DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<BgmSettings>;
    const volume =
      typeof parsed.volume === "number"
        ? Math.min(1, Math.max(0, parsed.volume))
        : BGM_DEFAULT_SETTINGS.volume;
    const muted =
      typeof parsed.muted === "boolean"
        ? parsed.muted
        : BGM_DEFAULT_SETTINGS.muted;
    const trackId = isBgmTrackId(parsed.trackId)
      ? parsed.trackId
      : BGM_DEFAULT_SETTINGS.trackId;
    return { volume, muted, trackId };
  } catch {
    return BGM_DEFAULT_SETTINGS;
  }
}

export function writeStoredBgmSettings(settings: BgmSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BGM_STORAGE_KEY, JSON.stringify(settings));
}

export function applyBgmSettings(next: BgmSettings) {
  const track = getBgmTrack(next.trackId);
  const audio = getSharedAudio(track.src);
  if (!audio) return;
  audio.volume = next.volume;
  audio.muted = next.muted;
}

function bindAutoplayUnlock(onPlay: () => void) {
  if (autoplayBound) return;
  autoplayBound = true;

  const tryPlay = () => {
    const audio = sharedAudio;
    if (!audio || audio.muted) return;
    void audio.play().then(onPlay).catch(() => {});
  };

  const unlock = () => {
    tryPlay();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export async function tryStartBgmPlayback(
  trackId: BgmTrackId,
): Promise<"playing" | "blocked" | "muted"> {
  const track = getBgmTrack(trackId);
  const audio = getSharedAudio(track.src);
  if (!audio || audio.muted) return "muted";

  try {
    await audio.play();
    return "playing";
  } catch {
    bindAutoplayUnlock(() => {});
    return "blocked";
  }
}

export function resetAutoplayBinding() {
  autoplayBound = false;
}
