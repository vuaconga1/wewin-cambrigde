export const VOICE_STORAGE_KEY = "wewin_voice_settings";
export const VOICE_DEFAULT_VOLUME = 0.9;

export type VoiceSettings = {
  volume: number;
  muted: boolean;
};

export const VOICE_DEFAULT_SETTINGS: VoiceSettings = {
  volume: VOICE_DEFAULT_VOLUME,
  muted: false,
};

type VoiceListener = () => void;
const listeners = new Set<VoiceListener>();

export function subscribeVoiceSettings(listener: VoiceListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyVoiceListeners() {
  listeners.forEach((listener) => listener());
}

function parseStoredSettings(): VoiceSettings {
  try {
    const raw = localStorage.getItem(VOICE_STORAGE_KEY);
    if (!raw) return VOICE_DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>;
    const volume =
      typeof parsed.volume === "number"
        ? Math.min(1, Math.max(0, parsed.volume))
        : VOICE_DEFAULT_SETTINGS.volume;
    const muted =
      typeof parsed.muted === "boolean"
        ? parsed.muted
        : VOICE_DEFAULT_SETTINGS.muted;
    return { volume, muted };
  } catch {
    return VOICE_DEFAULT_SETTINGS;
  }
}

/** Snapshot ổn định để useSyncExternalStore không lặp vô hạn. */
let cachedSettings: VoiceSettings | null = null;

export function readVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") return VOICE_DEFAULT_SETTINGS;
  cachedSettings ??= parseStoredSettings();
  return cachedSettings;
}

export function writeVoiceSettings(settings: VoiceSettings) {
  if (typeof window === "undefined") return;
  cachedSettings = settings;
  localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(settings));
  notifyVoiceListeners();
}

/** Hệ số nhân âm lượng cho lời động viên khi trả lời đúng/sai (0 = tắt). */
export function getVoiceVolumeMultiplier(): number {
  const settings = readVoiceSettings();
  if (settings.muted || settings.volume <= 0) return 0;
  return settings.volume;
}
