export const SFX_STORAGE_KEY = "wewin_sfx_settings";
export const SFX_DEFAULT_VOLUME = 0.75;

export type SfxSettings = {
  volume: number;
  muted: boolean;
};

export const SFX_DEFAULT_SETTINGS: SfxSettings = {
  volume: SFX_DEFAULT_VOLUME,
  muted: false,
};

type SfxListener = () => void;
const listeners = new Set<SfxListener>();

export function subscribeSfxSettings(listener: SfxListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifySfxListeners() {
  listeners.forEach((listener) => listener());
}

export function readSfxSettings(): SfxSettings {
  if (typeof window === "undefined") return SFX_DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(SFX_STORAGE_KEY);
    if (!raw) return SFX_DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SfxSettings>;
    const volume =
      typeof parsed.volume === "number"
        ? Math.min(1, Math.max(0, parsed.volume))
        : SFX_DEFAULT_SETTINGS.volume;
    const muted =
      typeof parsed.muted === "boolean"
        ? parsed.muted
        : SFX_DEFAULT_SETTINGS.muted;
    return { volume, muted };
  } catch {
    return SFX_DEFAULT_SETTINGS;
  }
}

export function writeSfxSettings(settings: SfxSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SFX_STORAGE_KEY, JSON.stringify(settings));
  notifySfxListeners();
}

/** Hệ số nhân âm lượng cho click + hiệu ứng game (0 = tắt). */
export function getSfxVolumeMultiplier(): number {
  const settings = readSfxSettings();
  if (settings.muted || settings.volume <= 0) return 0;
  return settings.volume;
}
