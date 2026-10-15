export type BgmTrackId = "cloud-garden" | "playground-fun" | "childhood-dreams";

export type BgmTrack = {
  id: BgmTrackId;
  label: string;
  src: string;
};

export const BGM_TRACKS: BgmTrack[] = [
  {
    id: "cloud-garden",
    label: "Cloud Garden",
    src: "/audio/cloud-garden-bgm.mp3",
  },
  {
    id: "playground-fun",
    label: "Playground Fun",
    src: "/audio/playground-fun-bgm.mp3",
  },
  {
    id: "childhood-dreams",
    label: "Childhood Dreams",
    src: "/audio/childhood-dreams-bgm.mp3",
  },
];

export const BGM_DEFAULT_TRACK_ID: BgmTrackId = "cloud-garden";

/** @deprecated Use BGM_TRACKS instead */
export const BGM_SRC = BGM_TRACKS[0].src;

export const BGM_STORAGE_KEY = "wewin_bgm_settings";
export const BGM_DEFAULT_VOLUME = 0.45;

export type BgmSettings = {
  volume: number;
  muted: boolean;
  trackId: BgmTrackId;
};

export const BGM_DEFAULT_SETTINGS: BgmSettings = {
  volume: BGM_DEFAULT_VOLUME,
  muted: false,
  trackId: BGM_DEFAULT_TRACK_ID,
};

export function getBgmTrack(id: BgmTrackId): BgmTrack {
  return BGM_TRACKS.find((track) => track.id === id) ?? BGM_TRACKS[0];
}

export function isBgmTrackId(value: unknown): value is BgmTrackId {
  return BGM_TRACKS.some((track) => track.id === value);
}
