export const BGM_SRC = "/audio/cloud-garden-bgm.mp3";
export const BGM_STORAGE_KEY = "wewin_bgm_settings";
export const BGM_DEFAULT_VOLUME = 0.45;

export type BgmSettings = {
  volume: number;
  muted: boolean;
};

export const BGM_DEFAULT_SETTINGS: BgmSettings = {
  volume: BGM_DEFAULT_VOLUME,
  muted: false,
};
