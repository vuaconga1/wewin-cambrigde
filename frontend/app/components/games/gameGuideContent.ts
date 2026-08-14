import type { GameKey } from "@/types/games";

type GameGuide = {
  title: string;
  summary: string;
  howToPlay: string;
};

export const GAME_GUIDES: Record<GameKey, GameGuide> = {
  matching: {
    title: "Matching Game",
    summary: "Những người bạn của các từ đang bị lạc mất nhau rồi!",
    howToPlay: "Em hãy chọn từ và hình hoặc nghĩa phù hợp để giúp từng đôi bạn tìm lại nhau nhé.",
  },
  flip: {
    title: "Flip Card Game",
    summary: "Mỗi tấm thẻ là một cánh cửa phép thuật đang giấu một từ mới.",
    howToPlay: "Em hãy chạm vào từng thẻ để xem hình, đọc từ và nghe phát âm. Mở hết các cánh cửa là chiến thắng!",
  },
  speak: {
    title: "Pronunciation Game",
    summary: "Chiếc micro phép thuật đang chờ nghe giọng nói thật tự tin của em.",
    howToPlay: "Đầu tiên bấm Nghe từ. Sau đó bấm Ghi âm, đọc thật rõ và cùng tớ xem em nhận được bao nhiêu sao nhé!",
  },
  memory: {
    title: "Memory Game",
    summary: "Các cặp thẻ thần kỳ đang chơi trốn tìm trong khu rừng.",
    howToPlay: "Mỗi lượt em được lật hai thẻ. Hãy nhớ vị trí và tìm đúng cặp từ với hình hoặc nghĩa của từ đó nhé!",
  },
  ordering: {
    title: "Word Ordering",
    summary: "Đoàn tàu chữ cái cần được xếp đúng thứ tự để rời ga.",
    howToPlay: "Em hãy bấm các từ theo thứ tự A–Z. Nếu chọn nhầm, bấm lại từ đó để đổi chỗ trước khi kiểm tra nhé.",
  },
  scramble: {
    title: "Word Scramble",
    summary: "Cơn gió tinh nghịch đã thổi các chữ cái bay lộn xộn mất rồi!",
    howToPlay: "Em hãy nhìn hình và nghĩa, ghép lại các chữ cái rồi nhập từ tiếng Anh đúng để hóa giải phép thuật nhé.",
  },
};

export const LEVEL_LIBRARY_GUIDE = {
  title: "🛡️ Hiệp sĩ WeWin chào em!",
  message:
    "Tớ sẽ dẫn em khám phá Vương quốc Tiếng Anh! KIDS là khu vườn đầu tiên, STARTERS là làng phép thuật, MOVERS là khu rừng phiêu lưu, còn FLYERS là lâu đài thử thách. Em hãy chọn một cánh cổng phù hợp để bắt đầu nhé!",
};
