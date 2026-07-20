import { playGameSfx, type GameSfxType } from "@/app/utils/gameSfx";

export type FeedbackSoundType = "correct" | "wrong";

/** @deprecated Prefer playGameSfx */
export function playFeedbackSound(type: FeedbackSoundType) {
  playGameSfx(type);
}

export { playGameSfx, type GameSfxType };
