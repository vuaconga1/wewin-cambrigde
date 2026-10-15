import type { GameKey } from "@/types/games";

type GameGuide = {
  title: string;
  summary: string;
  howToPlay: string;
};

export const GAME_GUIDES: Record<GameKey, GameGuide> = {
  matching: {
    title: "Matching Game",
    summary: "Các từ đang bị lạc mất bạn của mình rồi!",
    howToPlay: "Chọn từ và hình (hoặc nghĩa) phù hợp để ghép thành đôi nhé.",
  },
  flip: {
    title: "Flip Card Game",
    summary: "Mỗi tấm thẻ đang giấu một từ mới.",
    howToPlay: "Chạm vào thẻ để xem hình, đọc từ và nghe phát âm. Mở hết là thắng!",
  },
  speak: {
    title: "Pronunciation Game",
    summary: "Micro đang chờ nghe giọng nói tự tin của em.",
    howToPlay: "Bấm Nghe từ, rồi bấm Ghi âm và đọc thật rõ để nhận sao nhé!",
  },
  memory: {
    title: "Memory Game",
    summary: "Các cặp thẻ đang chơi trốn tìm.",
    howToPlay: "Mỗi lượt lật hai thẻ. Nhớ vị trí và tìm đúng cặp từ với hình (hoặc nghĩa) nhé!",
  },
  ordering: {
    title: "Word Ordering",
    summary: "Đoàn tàu chữ cái cần xếp đúng thứ tự.",
    howToPlay: "Bấm các từ theo thứ tự A–Z. Chọn nhầm thì bấm lại để đổi chỗ nhé.",
  },
  scramble: {
    title: "Word Scramble",
    summary: "Các chữ cái đã bị thổi bay lộn xộn rồi!",
    howToPlay: "Nhìn hình và nghĩa, ghép lại chữ cái rồi nhập từ tiếng Anh đúng nhé.",
  },
};

export const LEVEL_LIBRARY_GUIDE = {
  title: "🛡️ Hiệp sĩ WeWin chào em!",
  message:
    "Cùng khám phá Vương quốc Tiếng Anh nhé! Em hãy chọn một cấp độ phù hợp để bắt đầu.",
};
