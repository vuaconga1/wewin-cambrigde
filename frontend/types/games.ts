export type WordAudioContext = {
  bookType: string;
  gameSlug: string;
};

export type WordItem = {
  id: string;
  text: string;
  icon?: string; // Icon URL (tùy chọn)
  emoji?: string; // Emoji (tùy chọn)
  meaning?: string; // Nghĩa tiếng Việt (tùy chọn)
  audio?: string;
  link?: string;
  audioUrl?: string;
};

export type FlashcardGameConfig = {
  title: string;
  words: WordItem[];
  autoAudio?: boolean;
  audioContext?: WordAudioContext;
};

export type MatchingPair = {
  left: string;
  right: string;
};

export type MatchingGameConfig = {
  title: string;
  pairs: MatchingPair[];
  showScore?: boolean; // Hiển thị điểm số
};

export type FlipCardGameConfig = {
  title: string;
  words: WordItem[];
  autoAudio?: boolean;
  audioContext?: WordAudioContext;
};

export type PronunciationGameConfig = {
  title: string;
  words: WordItem[];
  audioContext?: WordAudioContext;
};

export type MemoryGameConfig = {
  title: string;
  words: WordItem[];
  showScore?: boolean;
  audioContext?: WordAudioContext;
};

export type WordOrderingGameConfig = {
  title: string;
  words: WordItem[];
  showScore?: boolean;
};

export type WordScrambleGameConfig = {
  title: string;
  words: WordItem[];
  showScore?: boolean;
};

export type GameKey =
  | "matching"
  | "flip"
  | "speak"
  | "memory"
  | "ordering"
  | "scramble";

export const DEFAULT_ENABLED_GAMES: GameKey[] = [
  "flip",
  "speak",
  "memory",
  "ordering",
  "scramble",
];

export type UnitGamePart = {
  id: string;
  title: string;
  words: WordItem[];
  enabledGames?: GameKey[];
};

export type UnitGameConfig = {
  slug: string;
  name: string;
  unit: string; // Unit game ID (ví dụ: "Unit 1", "Unit 8")
  bookname: string;
  bookType?: string;
  flashcards: FlashcardGameConfig;
  matching: MatchingGameConfig;
  wordOrdering?: WordOrderingGameConfig;
  wordScramble?: WordScrambleGameConfig;
  enabledGames?: GameKey[];
  parts?: UnitGamePart[];
  backgroundColor?: string; // Màu background theo chủ đề (ví dụ: "from-blue-50 via-purple-50 to-pink-50")
  useRotatingGame?: boolean; // Nếu true, sẽ tự động tính enabledGames với 3 game cố định + 1 game xoay vòng
};
