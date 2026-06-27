import type { UnitGameConfig, WordItem } from "@/types/games";
import { normalizeUnitGameConfigs } from "@/lib/constants/gameConfigHelpers";

/**
 * Cấu trúc định nghĩa cuốn sách Starter Book
 * Sử dụng cấu trúc game xoay vòng: 3 game cố định + 1 game xoay vòng
 */

// Helper function để tự động tạo matching pairs từ words
function createMatchingPairs(words: WordItem[]): { left: string; right: string }[] {
  return words.map((word) => ({
    left: word.emoji || word.text,
    right: word.meaning || word.text,
  }));
}

// ============================================
// HELLO UNIT – Từ vựng
// ============================================

// Part 1: Numbers - Số đếm
const UNIT0_PART1_WORDS: WordItem[] = [
  { id: "one", text: "one", emoji: "1️⃣", meaning: "Một" },
  { id: "two", text: "two", emoji: "2️⃣", meaning: "Hai" },
  { id: "three", text: "three", emoji: "3️⃣", meaning: "Ba" },
  { id: "four", text: "four", emoji: "4️⃣", meaning: "Bốn" },
  { id: "five", text: "five", emoji: "5️⃣", meaning: "Năm" },
  { id: "six", text: "six", emoji: "6️⃣", meaning: "Sáu" },
  { id: "seven", text: "seven", emoji: "7️⃣", meaning: "Bảy" },
  { id: "eight", text: "eight", emoji: "8️⃣", meaning: "Tám" },
  { id: "nine", text: "nine", emoji: "9️⃣", meaning: "Chín" },
  { id: "ten", text: "ten", emoji: "🔟", meaning: "Mười" },
  { id: "eleven", text: "eleven", emoji: "1️⃣1️⃣", meaning: "Mười một" },
  { id: "twelve", text: "twelve", emoji: "1️⃣2️⃣", meaning: "Mười hai" },
  { id: "thirteen", text: "thirteen", emoji: "1️⃣3️⃣", meaning: "Mười ba" },
  { id: "fourteen", text: "fourteen", emoji: "1️⃣4️⃣", meaning: "Mười bốn" },
  { id: "fifteen", text: "fifteen", emoji: "1️⃣5️⃣", meaning: "Mười lăm" },
  { id: "sixteen", text: "sixteen", emoji: "1️⃣6️⃣", meaning: "Mười sáu" },
  { id: "seventeen", text: "seventeen", emoji: "1️⃣7️⃣", meaning: "Mười bảy" },
  { id: "eighteen", text: "eighteen", emoji: "1️⃣8️⃣", meaning: "Mười tám" },
  { id: "nineteen", text: "nineteen", emoji: "1️⃣9️⃣", meaning: "Mười chín" },
  { id: "twenty", text: "twenty", emoji: "2️⃣0️⃣", meaning: "Hai mươi" }];

// Part 2: Colours - Màu sắc
const UNIT0_PART2_WORDS: WordItem[] = [
  { id: "blue", text: "blue", emoji: "🔵", meaning: "Màu xanh dương" },
  { id: "grey", text: "grey", emoji: "⚪", meaning: "Màu xám" },
  { id: "brown", text: "brown", emoji: "🟤", meaning: "Màu nâu" },
  { id: "purple", text: "purple", emoji: "🟣", meaning: "Màu tím" },
  { id: "black", text: "black", emoji: "⚫", meaning: "Màu đen" },
  { id: "red", text: "red", emoji: "🔴", meaning: "Màu đỏ" },
  { id: "yellow", text: "yellow", emoji: "🟡", meaning: "Màu vàng" },
  { id: "green", text: "green", emoji: "🟢", meaning: "Màu xanh lá" },
  { id: "pink", text: "pink", emoji: "🩷", meaning: "Màu hồng" },
  { id: "orange_color", text: "orange", emoji: "🟠", meaning: "Màu cam" },
  { id: "white", text: "white", emoji: "⬜", meaning: "Màu trắng" }];

// Part 3: Objects & Nature - Đồ vật & Thiên nhiên
const UNIT0_PART3_WORDS: WordItem[] = [
  { id: "hat_hello", text: "hat", emoji: "🎩", meaning: "Mũ" },
  { id: "cat_hello", text: "cat", emoji: "🐱", meaning: "Con mèo" },
  { id: "ice_cream_hello", text: "ice cream", emoji: "🍦", meaning: "Kem" },
  { id: "apple_hello", text: "apple", emoji: "🍎", meaning: "Táo" },
  { id: "dog_hello", text: "dog", emoji: "🐕", meaning: "Con chó" },
  { id: "kite_hello", text: "kite", emoji: "🪁", meaning: "Diều" },
  { id: "boat", text: "boat", emoji: "⛵", meaning: "Thuyền" },
  { id: "elephant", text: "elephant", emoji: "🐘", meaning: "Con voi" },
  { id: "tree", text: "tree", emoji: "🌳", meaning: "Cây" },
  { id: "flower", text: "flower", emoji: "🌸", meaning: "Hoa" }];

// ============================================
// UNIT 1 – I love animals! - Từ vựng
// ============================================

// Part 1: Farm Animals & Pets - Động vật nuôi & Trang trại
const UNIT1_PART1_WORDS: WordItem[] = [
  { id: "chicken", text: "chicken", emoji: "🐔", meaning: "Con gà" },
  { id: "cat", text: "cat", emoji: "🐱", meaning: "Con mèo" },
  { id: "dog", text: "dog", emoji: "🐕", meaning: "Con chó" },
  { id: "bird", text: "bird", emoji: "🐦", meaning: "Con chim" },
  { id: "horse", text: "horse", emoji: "🐴", meaning: "Con ngựa" },
  { id: "sheep", text: "sheep", emoji: "🐑", meaning: "Con cừu" },
  { id: "duck", text: "duck", emoji: "🦆", meaning: "Con vịt" },
  { id: "cow", text: "cow", emoji: "🐄", meaning: "Con bò" },
  { id: "fish", text: "fish", emoji: "🐟", meaning: "Con cá" },
  { id: "mouse", text: "mouse", emoji: "🐭", meaning: "Con chuột" },
  { id: "goat", text: "goat", emoji: "🐐", meaning: "Con dê" },
  { id: "donkey", text: "donkey", emoji: "🫏", meaning: "Con lừa" }];

// Part 2: Wild Animals & Small Creatures - Động vật hoang dã & Sinh vật nhỏ
const UNIT1_PART2_WORDS: WordItem[] = [
  { id: "frog", text: "frog", emoji: "🐸", meaning: "Con ếch" },
  { id: "bees", text: "bees", emoji: "🐝", meaning: "Con ong" },
  { id: "spider", text: "spider", emoji: "🕷️", meaning: "Con nhện" },
  { id: "snake", text: "snake", emoji: "🐍", meaning: "Con rắn" },
  { id: "tiger", text: "tiger", emoji: "🐅", meaning: "Con hổ" },
  { id: "monkey", text: "monkey", emoji: "🐒", meaning: "Con khỉ" },
  { id: "crocodile", text: "crocodile", emoji: "🐊", meaning: "Con cá sấu" },
  { id: "hippo", text: "hippo", emoji: "🦛", meaning: "Con hà mã" },
  { id: "lizard", text: "lizard", emoji: "🦎", meaning: "Con thằn lằn" },
  { id: "polar_bear", text: "polar bear", emoji: "🐻‍❄️", meaning: "Gấu Bắc Cực" },
  { id: "giraffe", text: "giraffe", emoji: "🦒", meaning: "Con hươu cao cổ" },
  { id: "zebra", text: "zebra", emoji: "🦓", meaning: "Con ngựa vằn" }];

// ============================================
// UNIT 2 – At home - Từ vựng
// ============================================

// Part 1: Living Room - Phòng khách
const UNIT2_PART1_WORDS: WordItem[] = [
  { id: "television", text: "television", emoji: "📺", meaning: "Tivi" },
  { id: "rug", text: "rug", emoji: "🟫", meaning: "Thảm" },
  { id: "window", text: "window", emoji: "🪟", meaning: "Cửa sổ" },
  { id: "sofa", text: "sofa", emoji: "🛋️", meaning: "Ghế sofa" },
  { id: "lamp", text: "lamp", emoji: "🪔", meaning: "Đèn" },
  { id: "armchair", text: "armchair", emoji: "🪑", meaning: "Ghế bành" },
  { id: "door", text: "door", emoji: "🚪", meaning: "Cửa ra vào" },
  { id: "table", text: "table", emoji: "🪵", meaning: "Bàn" },
  { id: "bookcase", text: "bookcase", emoji: "📚", meaning: "Tủ sách" },
  { id: "wall", text: "wall", emoji: "🧱", meaning: "Tường" },
  { id: "mirror", text: "mirror", emoji: "🪞", meaning: "Gương" },
  { id: "picture", text: "picture", emoji: "🖼️", meaning: "Bức tranh" }];

// Part 2: Bedroom - Phòng ngủ
const UNIT2_PART2_WORDS: WordItem[] = [
  { id: "bed", text: "bed", emoji: "🛏️", meaning: "Giường" },
  { id: "computer", text: "computer", emoji: "💻", meaning: "Máy tính" },
  { id: "clock", text: "clock", emoji: "🕐", meaning: "Đồng hồ" },
  { id: "box", text: "box", emoji: "📦", meaning: "Hộp" },
  { id: "radio", text: "radio", emoji: "📻", meaning: "Đài radio" },
  { id: "cupboard", text: "cupboard", emoji: "🗄️", meaning: "Tủ đựng đồ" },
  { id: "desk", text: "desk", emoji: "🪑", meaning: "Bàn học" }];

// Part 3: Rooms - Các phòng trong nhà
const UNIT2_PART3_WORDS: WordItem[] = [
  { id: "living_room", text: "living room", emoji: "🛋️", meaning: "Phòng khách" },
  { id: "dining_room", text: "dining room", emoji: "🍽️", meaning: "Phòng ăn" },
  { id: "bedroom", text: "bedroom", emoji: "🛏️", meaning: "Phòng ngủ" },
  { id: "hall", text: "hall", emoji: "🚶", meaning: "Hành lang" },
  { id: "bathroom", text: "bathroom", emoji: "🛁", meaning: "Phòng tắm" },
  { id: "kitchen", text: "kitchen", emoji: "🍳", meaning: "Nhà bếp" }];

// Part 4: Prepositions - Giới từ
const UNIT2_PART4_WORDS: WordItem[] = [
  { id: "behind", text: "behind", emoji: "⬅️", meaning: "Phía sau" },
  { id: "between", text: "between", emoji: "↔️", meaning: "Ở giữa" },
  { id: "under", text: "under", emoji: "⬇️", meaning: "Ở dưới" },
  { id: "in_front_of", text: "in front of", emoji: "➡️", meaning: "Phía trước" },
  { id: "next_to", text: "next to", emoji: "↩️", meaning: "Bên cạnh" },
  { id: "on", text: "on", emoji: "⬆️", meaning: "Ở trên" },
  { id: "in", text: "in", emoji: "📦", meaning: "Ở trong" }];

// ============================================
// UNIT 3 – Family and friends - Từ vựng
// ============================================

// Part 1: Family Members - Thành viên gia đình
const UNIT3_PART1_WORDS: WordItem[] = [
  { id: "mother", text: "mother", emoji: "👩", meaning: "Mẹ" },
  { id: "father", text: "father", emoji: "👨", meaning: "Bố" },
  { id: "sister", text: "sister", emoji: "👧", meaning: "Chị/Em gái" },
  { id: "brother", text: "brother", emoji: "👦", meaning: "Anh/Em trai" },
  { id: "baby", text: "baby", emoji: "👶", meaning: "Em bé" },
  { id: "grandmother", text: "grandmother", emoji: "👵", meaning: "Bà" },
  { id: "grandfather", text: "grandfather", emoji: "👴", meaning: "Ông" },
  { id: "cousin", text: "cousin", emoji: "🧑", meaning: "Anh/Chị/Em họ" }];

// Part 2: People - Con người
const UNIT3_PART2_WORDS: WordItem[] = [
  { id: "boy", text: "boy", emoji: "👦", meaning: "Con trai" },
  { id: "girl", text: "girl", emoji: "👧", meaning: "Con gái" },
  { id: "man", text: "man", emoji: "👨", meaning: "Đàn ông" },
  { id: "woman", text: "woman", emoji: "👩", meaning: "Phụ nữ" },
  { id: "men", text: "men", emoji: "👬", meaning: "Những người đàn ông" },
  { id: "women", text: "women", emoji: "👭", meaning: "Những người phụ nữ" },
  { id: "child", text: "child", emoji: "🧒", meaning: "Đứa trẻ" },
  { id: "children", text: "children", emoji: "👧👦", meaning: "Những đứa trẻ" },
  { id: "person", text: "person", emoji: "🧑", meaning: "Người" },
  { id: "people", text: "people", emoji: "👥", meaning: "Mọi người" },
  { id: "friend", text: "friend", emoji: "🤝", meaning: "Bạn bè" }];

// Part 3: Adjectives - Tính từ
const UNIT3_PART3_WORDS: WordItem[] = [
  { id: "big", text: "big", emoji: "🐘", meaning: "To, lớn" },
  { id: "small", text: "small", emoji: "🐭", meaning: "Nhỏ" },
  { id: "happy", text: "happy", emoji: "😊", meaning: "Vui vẻ" },
  { id: "sad", text: "sad", emoji: "😢", meaning: "Buồn" },
  { id: "old", text: "old", emoji: "👴", meaning: "Già" },
  { id: "young", text: "young", emoji: "👶", meaning: "Trẻ" },
  { id: "silly", text: "silly", emoji: "🤪", meaning: "Ngớ ngẩn" },
  { id: "funny", text: "funny", emoji: "😂", meaning: "Hài hước" },
  { id: "beautiful", text: "beautiful", emoji: "🌸", meaning: "Đẹp" },
  { id: "ugly", text: "ugly", emoji: "👹", meaning: "Xấu xí" },
  { id: "dirty", text: "dirty", emoji: "🤢", meaning: "Bẩn" },
  { id: "clean", text: "clean", emoji: "✨", meaning: "Sạch" },
  { id: "new", text: "new", emoji: "🆕", meaning: "Mới" },
  { id: "open", text: "open", emoji: "📖", meaning: "Mở" },
  { id: "closed", text: "closed", emoji: "📕", meaning: "Đóng" },
  { id: "angry", text: "angry", emoji: "😠", meaning: "Tức giận" }];

// ============================================
// UNIT 4 – Food! - Từ vựng
// ============================================

// Part 1: Fruits - Trái cây
const UNIT4_PART1_WORDS: WordItem[] = [
  { id: "banana", text: "banana", emoji: "🍌", meaning: "Chuối" },
  { id: "orange", text: "orange", emoji: "🍊", meaning: "Cam" },
  { id: "lemon", text: "lemon", emoji: "🍋", meaning: "Chanh vàng" },
  { id: "pineapple", text: "pineapple", emoji: "🍍", meaning: "Dứa" },
  { id: "mango", text: "mango", emoji: "🥭", meaning: "Xoài" },
  { id: "grapes", text: "grapes", emoji: "🍇", meaning: "Nho" },
  { id: "kiwi", text: "kiwi", emoji: "🥝", meaning: "Kiwi" },
  { id: "apple", text: "apple", emoji: "🍎", meaning: "Táo" },
  { id: "lime", text: "lime", emoji: "🍋‍🟩", meaning: "Chanh xanh" },
  { id: "pear", text: "pear", emoji: "🍐", meaning: "Lê" },
  { id: "watermelon", text: "watermelon", emoji: "🍉", meaning: "Dưa hấu" },
  { id: "coconut", text: "coconut", emoji: "🥥", meaning: "Dừa" }];

// Part 2: Vegetables, Drinks & Meals - Rau củ, Đồ uống & Bữa ăn
const UNIT4_PART2_WORDS: WordItem[] = [
  // Vegetables
  { id: "potato", text: "potato", emoji: "🥔", meaning: "Khoai tây" },
  { id: "carrot", text: "carrot", emoji: "🥕", meaning: "Cà rốt" },
  { id: "onion", text: "onion", emoji: "🧅", meaning: "Hành tây" },
  { id: "tomato", text: "tomato", emoji: "🍅", meaning: "Cà chua" },
  { id: "beans", text: "beans", emoji: "🫘", meaning: "Đậu" },
  { id: "peas", text: "peas", emoji: "🟢", meaning: "Đậu Hà Lan" },
  // Drinks
  { id: "milk", text: "milk", emoji: "🥛", meaning: "Sữa" },
  { id: "lemonade", text: "lemonade", emoji: "🍋", meaning: "Nước chanh" },
  { id: "water", text: "water", emoji: "💧", meaning: "Nước" },
  { id: "orange_juice", text: "orange juice", emoji: "🧃", meaning: "Nước cam" },
  // Meals
  { id: "breakfast", text: "breakfast", emoji: "🍳", meaning: "Bữa sáng" },
  { id: "lunch", text: "lunch", emoji: "🍱", meaning: "Bữa trưa" },
  { id: "dinner", text: "dinner", emoji: "🍽️", meaning: "Bữa tối" }];

// Part 3: Other Food - Các loại thức ăn khác
const UNIT4_PART3_WORDS: WordItem[] = [
  { id: "bread", text: "bread", emoji: "🍞", meaning: "Bánh mì" },
  { id: "rice", text: "rice", emoji: "🍚", meaning: "Cơm" },
  { id: "pie", text: "pie", emoji: "🥧", meaning: "Bánh nướng" },
  { id: "egg", text: "egg", emoji: "🥚", meaning: "Trứng" },
  { id: "sausage", text: "sausage", emoji: "🌭", meaning: "Xúc xích" },
  { id: "burger", text: "burger", emoji: "🍔", meaning: "Bánh hamburger" },
  { id: "chips", text: "chips", emoji: "🍟", meaning: "Khoai tây chiên" },
  { id: "meat", text: "meat", emoji: "🥩", meaning: "Thịt" },
  { id: "fish_food", text: "fish", emoji: "🐟", meaning: "Cá" },
  { id: "meatballs", text: "meatballs", emoji: "🧆", meaning: "Thịt viên" },
  { id: "ice_cream", text: "ice cream", emoji: "🍦", meaning: "Kem" },
  { id: "cake", text: "cake", emoji: "🎂", meaning: "Bánh kem" },
  { id: "chocolate", text: "chocolate", emoji: "🍫", meaning: "Sô cô la" },
  { id: "sweets", text: "sweets", emoji: "🍬", meaning: "Kẹo" }];

// ============================================
// UNIT 5 – I like clothes - Từ vựng
// ============================================

// Part 1: Upper Body Clothes & Accessories - Áo & Phụ kiện
const UNIT5_PART1_WORDS: WordItem[] = [
  { id: "shirt", text: "shirt", emoji: "👔", meaning: "Áo sơ mi" },
  { id: "tshirt", text: "T-shirt", emoji: "👕", meaning: "Áo thun" },
  { id: "jacket", text: "jacket", emoji: "🧥", meaning: "Áo khoác" },
  { id: "dress", text: "dress", emoji: "👗", meaning: "Váy đầm" },
  { id: "hat", text: "hat", emoji: "🎩", meaning: "Mũ" },
  { id: "glasses", text: "glasses", emoji: "👓", meaning: "Kính mắt" },
  { id: "watch", text: "watch", emoji: "⌚", meaning: "Đồng hồ đeo tay" }];

// Part 2: Lower Body & Other Items - Quần & Đồ khác
const UNIT5_PART2_WORDS: WordItem[] = [
  { id: "trousers", text: "trousers", emoji: "👖", meaning: "Quần dài" },
  { id: "skirt", text: "skirt", emoji: "🩳", meaning: "Váy ngắn" },
  { id: "jeans", text: "jeans", emoji: "👖", meaning: "Quần jean" },
  { id: "socks", text: "socks", emoji: "🧦", meaning: "Tất" },
  { id: "shoe", text: "shoe", emoji: "👟", meaning: "Giày" },
  { id: "handbag", text: "handbag", emoji: "👜", meaning: "Túi xách" }];

// ============================================
// UNIT 6 – Look at us! - Từ vựng
// ============================================

// Part 1: Body Parts - Các bộ phận cơ thể
const UNIT6_PART1_WORDS: WordItem[] = [
  { id: "head", text: "head", emoji: "🗣️", meaning: "Đầu" },
  { id: "eye", text: "eye", emoji: "👁️", meaning: "Mắt" },
  { id: "nose", text: "nose", emoji: "👃", meaning: "Mũi" },
  { id: "mouth", text: "mouth", emoji: "👄", meaning: "Miệng" },
  { id: "ear", text: "ear", emoji: "👂", meaning: "Tai" },
  { id: "face", text: "face", emoji: "😊", meaning: "Khuôn mặt" },
  { id: "hair", text: "hair", emoji: "💇", meaning: "Tóc" },
  { id: "body", text: "body", emoji: "🧍", meaning: "Cơ thể" },
  { id: "arm", text: "arm", emoji: "💪", meaning: "Cánh tay" },
  { id: "hand", text: "hand", emoji: "✋", meaning: "Bàn tay" },
  { id: "leg", text: "leg", emoji: "🦵", meaning: "Chân" },
  { id: "foot", text: "foot (feet)", emoji: "🦶", meaning: "Bàn chân" },
  { id: "tail", text: "tail", emoji: "🐕", meaning: "Đuôi" }];

// Part 2: Toys - Đồ chơi
const UNIT6_PART2_WORDS: WordItem[] = [
  { id: "doll", text: "doll", emoji: "🎎", meaning: "Búp bê" },
  { id: "monster", text: "monster", emoji: "👹", meaning: "Quái vật" },
  { id: "alien", text: "alien", emoji: "👽", meaning: "Người ngoài hành tinh" },
  { id: "robot", text: "robot", emoji: "🤖", meaning: "Robot" },
  { id: "kite", text: "kite", emoji: "🪁", meaning: "Diều" },
  { id: "ball", text: "ball", emoji: "⚽", meaning: "Bóng" },
  { id: "teddy_bear", text: "teddy bear", emoji: "🧸", meaning: "Gấu bông" },
  { id: "camera", text: "camera", emoji: "📷", meaning: "Máy ảnh" },
  { id: "balloon", text: "balloon", emoji: "🎈", meaning: "Bóng bay" }];

// ============================================
// UNIT 7 – We love school! - Từ vựng
// ============================================

// Part 1: Classroom Objects - Đồ dùng lớp học
const UNIT7_PART1_WORDS: WordItem[] = [
  { id: "book", text: "book", emoji: "📖", meaning: "Sách" },
  { id: "computer", text: "computer", emoji: "💻", meaning: "Máy tính" },
  { id: "mouse_device", text: "mouse", emoji: "🖱️", meaning: "Chuột máy tính" },
  { id: "teacher", text: "teacher", emoji: "👩‍🏫", meaning: "Giáo viên" },
  { id: "board", text: "board", emoji: "📋", meaning: "Bảng" },
  { id: "rubber", text: "rubber", emoji: "🧽", meaning: "Cục tẩy" },
  { id: "ruler", text: "ruler", emoji: "📏", meaning: "Thước kẻ" },
  { id: "keyboard", text: "keyboard", emoji: "⌨️", meaning: "Bàn phím" },
  { id: "page", text: "page", emoji: "📄", meaning: "Trang giấy" },
  { id: "pen", text: "pen", emoji: "🖊️", meaning: "Bút mực" },
  { id: "poster", text: "poster", emoji: "🖼️", meaning: "Áp phích" },
  { id: "pencil", text: "pencil", emoji: "✏️", meaning: "Bút chì" },
  { id: "painting", text: "painting", emoji: "🎨", meaning: "Bức tranh" },
  { id: "crayon", text: "crayon", emoji: "🖍️", meaning: "Bút sáp màu" },
  { id: "paper", text: "paper", emoji: "📝", meaning: "Giấy" },
  { id: "bag", text: "bag", emoji: "🎒", meaning: "Cặp sách" }];

// Part 2: Actions - Hành động
const UNIT7_PART2_WORDS: WordItem[] = [
  { id: "writing", text: "writing", emoji: "✍️", meaning: "Viết" },
  { id: "standing_up", text: "standing up", emoji: "🧍", meaning: "Đứng lên" },
  { id: "pointing", text: "pointing", emoji: "👉", meaning: "Chỉ" },
  { id: "picking_up", text: "picking up", emoji: "🤲", meaning: "Nhặt lên" },
  { id: "sitting_down", text: "sitting down", emoji: "🪑", meaning: "Ngồi xuống" },
  { id: "talking", text: "talking", emoji: "🗣️", meaning: "Nói chuyện" },
  { id: "smiling", text: "smiling", emoji: "😊", meaning: "Mỉm cười" },
  { id: "learning", text: "learning", emoji: "📚", meaning: "Học" },
  { id: "making", text: "making", emoji: "🛠️", meaning: "Làm" },
  { id: "sleeping", text: "sleeping", emoji: "😴", meaning: "Ngủ" }];

// ============================================
// UNIT 8 – In the playground - Từ vựng
// ============================================

// Part 1: Sports - Thể thao
const UNIT8_PART1_WORDS: WordItem[] = [
  { id: "tennis", text: "tennis", emoji: "🎾", meaning: "Quần vợt" },
  { id: "badminton", text: "badminton", emoji: "🏸", meaning: "Cầu lông" },
  { id: "hockey", text: "hockey", emoji: "🏒", meaning: "Khúc côn cầu" },
  { id: "table_tennis", text: "table tennis", emoji: "🏓", meaning: "Bóng bàn" },
  { id: "baseball", text: "baseball", emoji: "⚾", meaning: "Bóng chày" },
  { id: "basketball", text: "basketball", emoji: "🏀", meaning: "Bóng rổ" },
  { id: "football", text: "football", emoji: "⚽", meaning: "Bóng đá" }];

// Part 2: Actions - Hành động
const UNIT8_PART2_WORDS: WordItem[] = [
  { id: "running", text: "running", emoji: "🏃", meaning: "Chạy" },
  { id: "kicking", text: "kicking", emoji: "🦵", meaning: "Đá" },
  { id: "hitting", text: "hitting", emoji: "👊", meaning: "Đánh" },
  { id: "riding", text: "riding", emoji: "🚴", meaning: "Đi xe" },
  { id: "walking", text: "walking", emoji: "🚶", meaning: "Đi bộ" },
  { id: "bouncing", text: "bouncing", emoji: "⛹️", meaning: "Nảy" },
  { id: "throwing", text: "throwing", emoji: "🤾", meaning: "Ném" },
  { id: "catching", text: "catching", emoji: "🧤", meaning: "Bắt" },
  { id: "sitting", text: "sitting", emoji: "🪑", meaning: "Ngồi" },
  { id: "jumping", text: "jumping", emoji: "🦘", meaning: "Nhảy" }];

// ============================================
// UNIT 9 – My hobbies - Từ vựng
// ============================================

// Part 1: Music & Art Hobbies - Sở thích âm nhạc & nghệ thuật
const UNIT9_PART1_WORDS: WordItem[] = [
  { id: "playing_piano", text: "playing the piano", emoji: "🎹", meaning: "Chơi piano" },
  { id: "playing_guitar", text: "playing the guitar", emoji: "🎸", meaning: "Chơi guitar" },
  { id: "painting_hobby", text: "painting", emoji: "🎨", meaning: "Vẽ tranh" },
  { id: "drawing", text: "drawing", emoji: "✏️", meaning: "Vẽ" },
  { id: "singing_songs", text: "singing songs", emoji: "🎤", meaning: "Hát" },
  { id: "listening_music", text: "listening to music", emoji: "🎧", meaning: "Nghe nhạc" }];

// Part 2: Other Hobbies - Các sở thích khác
const UNIT9_PART2_WORDS: WordItem[] = [
  { id: "doing_sport", text: "doing sport", emoji: "🏃", meaning: "Chơi thể thao" },
  { id: "flying_kite", text: "flying a kite", emoji: "🪁", meaning: "Thả diều" },
  { id: "making_cakes", text: "making cakes", emoji: "🎂", meaning: "Làm bánh" },
  { id: "reading_stories", text: "reading stories", emoji: "📖", meaning: "Đọc truyện" },
  { id: "fishing_hobby", text: "fishing", emoji: "🎣", meaning: "Câu cá" },
  { id: "fishing_dad", text: "fishing with Dad", emoji: "👨‍👦", meaning: "Câu cá với bố" },
  { id: "board_games", text: "playing board games", emoji: "🎲", meaning: "Chơi cờ" },
  { id: "swimming", text: "swimming", emoji: "🏊", meaning: "Bơi lội" }];

// ============================================
// UNIT 10 – Your day - Từ vựng
// ============================================

// Part 1: Times of Day - Thời gian trong ngày
const UNIT10_PART1_WORDS: WordItem[] = [
  { id: "morning", text: "morning", emoji: "🌅", meaning: "Buổi sáng" },
  { id: "afternoon", text: "afternoon", emoji: "☀️", meaning: "Buổi chiều" },
  { id: "evening", text: "evening", emoji: "🌆", meaning: "Buổi tối" },
  { id: "night", text: "night", emoji: "🌙", meaning: "Ban đêm" }];

// Part 2: Daily Activities - Hoạt động hàng ngày
const UNIT10_PART2_WORDS: WordItem[] = [
  { id: "have_breakfast", text: "have breakfast", emoji: "🍳", meaning: "Ăn sáng" },
  { id: "have_dinner", text: "have dinner", emoji: "🍽️", meaning: "Ăn tối" },
  { id: "go_to_school", text: "go to school", emoji: "🏫", meaning: "Đi học" },
  { id: "go_to_bed", text: "go to bed", emoji: "🛏️", meaning: "Đi ngủ" },
  { id: "play_park", text: "play in the park", emoji: "🏞️", meaning: "Chơi ở công viên" },
  { id: "watch_tv", text: "watch television", emoji: "📺", meaning: "Xem tivi" },
  { id: "read_book", text: "read a book", emoji: "📚", meaning: "Đọc sách" },
  { id: "have_lessons", text: "have lessons", emoji: "📝", meaning: "Học bài" },
  { id: "listen_radio", text: "listen to the radio", emoji: "📻", meaning: "Nghe đài" },
  { id: "sleep_activity", text: "sleep", emoji: "😴", meaning: "Ngủ" },
  { id: "get_up", text: "get up", emoji: "⏰", meaning: "Thức dậy" },
  { id: "wash", text: "wash", emoji: "🚿", meaning: "Rửa mặt" },
  { id: "put_on_clothes", text: "put on clothes", emoji: "👕", meaning: "Mặc quần áo" }];

// ============================================
// ĐỊNH NGHĨA CUỐN SÁCH STARTER
// ============================================

// Gộp tất cả từ vựng Unit 1
const UNIT1_ALL_WORDS: WordItem[] = [...UNIT1_PART1_WORDS, ...UNIT1_PART2_WORDS];

// Gộp tất cả từ vựng Unit 2
const UNIT2_ALL_WORDS: WordItem[] = [...UNIT2_PART1_WORDS, ...UNIT2_PART2_WORDS, ...UNIT2_PART3_WORDS, ...UNIT2_PART4_WORDS];

// Gộp tất cả từ vựng Unit 3
const UNIT3_ALL_WORDS: WordItem[] = [...UNIT3_PART1_WORDS, ...UNIT3_PART2_WORDS, ...UNIT3_PART3_WORDS];

// Gộp tất cả từ vựng Unit 4
const UNIT4_ALL_WORDS: WordItem[] = [...UNIT4_PART1_WORDS, ...UNIT4_PART2_WORDS, ...UNIT4_PART3_WORDS];

// Gộp tất cả từ vựng Unit 5
const UNIT5_ALL_WORDS: WordItem[] = [...UNIT5_PART1_WORDS, ...UNIT5_PART2_WORDS];

// Gộp tất cả từ vựng Unit 6
const UNIT6_ALL_WORDS: WordItem[] = [...UNIT6_PART1_WORDS, ...UNIT6_PART2_WORDS];

// Gộp tất cả từ vựng Unit 7
const UNIT7_ALL_WORDS: WordItem[] = [...UNIT7_PART1_WORDS, ...UNIT7_PART2_WORDS];

// Gộp tất cả từ vựng Unit 8
const UNIT8_ALL_WORDS: WordItem[] = [...UNIT8_PART1_WORDS, ...UNIT8_PART2_WORDS];

// Gộp tất cả từ vựng Unit 9
const UNIT9_ALL_WORDS: WordItem[] = [...UNIT9_PART1_WORDS, ...UNIT9_PART2_WORDS];

// Gộp tất cả từ vựng Unit 10
const UNIT10_ALL_WORDS: WordItem[] = [...UNIT10_PART1_WORDS, ...UNIT10_PART2_WORDS];

// ============================================
// UNIT 11 – In the street - Từ vựng
// ============================================

// Part 1: Transport - Phương tiện giao thông
const UNIT11_PART1_WORDS: WordItem[] = [
  { id: "motorbike", text: "motorbike", emoji: "🏍️", meaning: "Xe máy" },
  { id: "bus", text: "bus", emoji: "🚌", meaning: "Xe buýt" },
  { id: "lorry", text: "lorry", emoji: "🚚", meaning: "Xe tải" },
  { id: "car", text: "car", emoji: "🚗", meaning: "Ô tô" },
  { id: "train", text: "train", emoji: "🚆", meaning: "Tàu hỏa" },
  { id: "ship", text: "ship", emoji: "🚢", meaning: "Tàu thủy" },
  { id: "helicopter", text: "helicopter", emoji: "🚁", meaning: "Trực thăng" },
  { id: "bike", text: "bike", emoji: "🚲", meaning: "Xe đạp" },
  { id: "plane", text: "plane", emoji: "✈️", meaning: "Máy bay" }];

// Part 2: Places - Địa điểm
const UNIT11_PART2_WORDS: WordItem[] = [
  { id: "park", text: "park", emoji: "🏞️", meaning: "Công viên" },
  { id: "shop", text: "shop", emoji: "🏪", meaning: "Cửa hàng" },
  { id: "school", text: "school", emoji: "🏫", meaning: "Trường học" },
  { id: "house", text: "house", emoji: "🏠", meaning: "Nhà" },
  { id: "flat", text: "flat", emoji: "🏢", meaning: "Căn hộ" },
  { id: "street", text: "street", emoji: "🛣️", meaning: "Đường phố" }];

// ============================================
// UNIT 12 – My grandparents - Từ vựng
// ============================================

// Part 1: Garden & Nature - Vườn & Thiên nhiên
const UNIT12_PART1_WORDS: WordItem[] = [
  { id: "garden", text: "garden", emoji: "🌻", meaning: "Vườn" },
  { id: "flowers", text: "flowers", emoji: "💐", meaning: "Những bông hoa" },
  { id: "sea", text: "sea", emoji: "🌊", meaning: "Biển" },
  { id: "sand", text: "sand", emoji: "🏖️", meaning: "Cát" }];

// ============================================
// UNIT 13 – Going to the zoo - Từ vựng
// ============================================

// Part 1: Zoo Animals - Động vật sở thú
const UNIT13_PART1_WORDS: WordItem[] = [
  { id: "polar_bear_zoo", text: "polar bear", emoji: "🐻‍❄️", meaning: "Gấu Bắc Cực" },
  { id: "crocodile_zoo", text: "crocodile", emoji: "🐊", meaning: "Cá sấu" },
  { id: "tiger_zoo", text: "tiger", emoji: "🐅", meaning: "Hổ" },
  { id: "zebra_zoo", text: "zebra", emoji: "🦓", meaning: "Ngựa vằn" },
  { id: "snake_zoo", text: "snake", emoji: "🐍", meaning: "Rắn" },
  { id: "monkey_zoo", text: "monkey", emoji: "🐒", meaning: "Khỉ" },
  { id: "bird_zoo", text: "bird", emoji: "🦜", meaning: "Chim" },
  { id: "giraffe_zoo", text: "giraffe", emoji: "🦒", meaning: "Hươu cao cổ" },
  { id: "hippo_zoo", text: "hippo", emoji: "🦛", meaning: "Hà mã" },
  { id: "lizard_zoo", text: "lizard", emoji: "🦎", meaning: "Thằn lằn" },
  { id: "elephant_zoo", text: "elephant", emoji: "🐘", meaning: "Voi" },
  { id: "spider_zoo", text: "spider", emoji: "🕷️", meaning: "Nhện" },
  { id: "frog_zoo", text: "frog", emoji: "🐸", meaning: "Ếch" }];

// ============================================
// UNIT 14 – Happy birthday! - Từ vựng
// ============================================

// Part 1: Party Items - Đồ tiệc
const UNIT14_PART1_WORDS: WordItem[] = [
  { id: "present", text: "present", emoji: "🎁", meaning: "Quà tặng" },
  { id: "camera_party", text: "camera", emoji: "📷", meaning: "Máy ảnh" },
  { id: "robot_party", text: "robot", emoji: "🤖", meaning: "Robot" },
  { id: "computer_party", text: "computer", emoji: "💻", meaning: "Máy tính" },
  { id: "balloon_party", text: "balloon", emoji: "🎈", meaning: "Bóng bay" },
  { id: "guitar", text: "guitar", emoji: "🎸", meaning: "Đàn guitar" },
  { id: "doll_party", text: "doll", emoji: "🎎", meaning: "Búp bê" },
  { id: "bike_party", text: "bike", emoji: "🚲", meaning: "Xe đạp" },
  { id: "kite_party", text: "kite", emoji: "🪁", meaning: "Diều" }];

// Part 2: Possessive Pronouns - Đại từ sở hữu
const UNIT14_PART2_WORDS: WordItem[] = [
  { id: "mine", text: "mine", emoji: "👆", meaning: "Của tôi" },
  { id: "yours", text: "yours", emoji: "👉", meaning: "Của bạn" },
  { id: "his", text: "his", emoji: "👨", meaning: "Của anh ấy" },
  { id: "hers", text: "hers", emoji: "👩", meaning: "Của cô ấy" },
  { id: "its", text: "its", emoji: "🐾", meaning: "Của nó" },
  { id: "ours", text: "ours", emoji: "👥", meaning: "Của chúng tôi" },
  { id: "theirs", text: "theirs", emoji: "👫", meaning: "Của họ" }];

// ============================================
// UNIT 15 – At the beach - Từ vựng
// ============================================

// Part 1: Beach Objects & Nature - Đồ vật & Thiên nhiên bãi biển
const UNIT15_PART1_WORDS: WordItem[] = [
  { id: "sea_beach", text: "sea", emoji: "🌊", meaning: "Biển" },
  { id: "sand_beach", text: "sand", emoji: "🏖️", meaning: "Cát" },
  { id: "beach", text: "beach", emoji: "🏝️", meaning: "Bãi biển" },
  { id: "water_beach", text: "water", emoji: "💧", meaning: "Nước" },
  { id: "jellyfish", text: "jellyfish", emoji: "🪼", meaning: "Sứa" },
  { id: "shells", text: "shells", emoji: "🐚", meaning: "Vỏ sò" },
  { id: "sun", text: "sun", emoji: "☀️", meaning: "Mặt trời" }];

// Gộp tất cả từ vựng các Unit mới
const UNIT0_ALL_WORDS: WordItem[] = [...UNIT0_PART1_WORDS, ...UNIT0_PART2_WORDS, ...UNIT0_PART3_WORDS];
const UNIT11_ALL_WORDS: WordItem[] = [...UNIT11_PART1_WORDS, ...UNIT11_PART2_WORDS];
const UNIT13_ALL_WORDS: WordItem[] = [...UNIT13_PART1_WORDS];
const UNIT14_ALL_WORDS: WordItem[] = [...UNIT14_PART1_WORDS, ...UNIT14_PART2_WORDS];
const UNIT15_ALL_WORDS: WordItem[] = [...UNIT15_PART1_WORDS];

export const STARTER_BOOK_CONFIG: (UnitGameConfig & { backgroundColor?: string })[] = normalizeUnitGameConfigs([
  // ========== HELLO UNIT ==========
  {
    slug: "hello-unit",
    name: "HELLO UNIT",
    unit: "Hello",
    bookname: "Starter Book",
    useRotatingGame: true, // Unit đầu có đầy đủ game
    backgroundColor: "from-indigo-50 via-blue-50 to-cyan-50",
    flashcards: {
      title: "Hello!",
      autoAudio: true,
      words: UNIT0_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT0_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT0_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT0_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Numbers 1-20",
        words: UNIT0_PART1_WORDS,
      },
      {
        id: "part2",
        title: "Colours",
        words: UNIT0_PART2_WORDS,
      },
      {
        id: "part3",
        title: "Objects & Nature",
        words: UNIT0_PART3_WORDS,
      }],
  },
  // ========== UNIT 1: I love animals! ==========
  {
    slug: "unit-1-i-love-animals",
    name: "UNIT 1 – I love animals!",
    unit: "Unit 1",
    bookname: "Starter Book",
    useRotatingGame: true, // Sử dụng cấu trúc game xoay vòng
    backgroundColor: "from-green-50 via-emerald-50 to-cyan-50",
    flashcards: {
      title: "I love animals!",
      autoAudio: true,
      words: UNIT1_PART1_WORDS, // Dùng part 1 làm mặc định
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT1_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT1_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT1_ALL_WORDS,
      showScore: true,
    },
    // Chia thành 2 parts
    parts: [
      {
        id: "part1",
        title: "Farm Animals & Pets",
        words: UNIT1_PART1_WORDS,
        // enabledGames sẽ tự động = ["matching", "flip", "speak", "memory"] (vì part index 0)
      },
      {
        id: "part2",
        title: "Wild Animals & Small Creatures",
        words: UNIT1_PART2_WORDS,
        // enabledGames sẽ tự động = ["matching", "flip", "speak", "ordering"] (vì part index 1)
      }],
  },
  // ========== UNIT 2: At home ==========
  {
    slug: "unit-2-at-home",
    name: "UNIT 2 – At home",
    unit: "Unit 2",
    bookname: "Starter Book",
    useRotatingGame: false, // Không dùng game xoay vòng từ Unit 2
    backgroundColor: "from-amber-50 via-orange-50 to-yellow-50",
    flashcards: {
      title: "At home",
      autoAudio: true,
      words: UNIT2_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT2_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT2_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT2_ALL_WORDS,
      showScore: true,
    },
    // Chia thành 3 parts
    parts: [
      {
        id: "part1",
        title: "Living Room",
        words: UNIT2_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Bedroom",
        words: UNIT2_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part3",
        title: "Rooms in the house",
        words: UNIT2_PART3_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part4",
        title: "Prepositions",
        words: UNIT2_PART4_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 3: Family and friends ==========
  {
    slug: "unit-3-family-and-friends",
    name: "UNIT 3 – Family and friends",
    unit: "Unit 3",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-pink-50 via-rose-50 to-red-50",
    flashcards: {
      title: "Family and friends",
      autoAudio: true,
      words: UNIT3_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT3_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT3_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT3_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Family Members",
        words: UNIT3_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "People",
        words: UNIT3_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part3",
        title: "Adjectives",
        words: UNIT3_PART3_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 4: Food! ==========
  {
    slug: "unit-4-food",
    name: "UNIT 4 – Food!",
    unit: "Unit 4",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-yellow-50 via-orange-50 to-red-50",
    flashcards: {
      title: "Food!",
      autoAudio: true,
      words: UNIT4_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT4_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT4_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT4_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Fruits",
        words: UNIT4_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Vegetables, Drinks & Meals",
        words: UNIT4_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part3",
        title: "Other Food",
        words: UNIT4_PART3_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 5: I like clothes ==========
  {
    slug: "unit-5-i-like-clothes",
    name: "UNIT 5 – I like clothes",
    unit: "Unit 5",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-purple-50 via-pink-50 to-fuchsia-50",
    flashcards: {
      title: "I like clothes",
      autoAudio: true,
      words: UNIT5_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT5_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT5_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT5_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Upper Body Clothes & Accessories",
        words: UNIT5_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Lower Body & Other Items",
        words: UNIT5_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 6: Look at us! ==========
  {
    slug: "unit-6-look-at-us",
    name: "UNIT 6 – Look at us!",
    unit: "Unit 6",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-sky-50 via-blue-50 to-indigo-50",
    flashcards: {
      title: "Look at us!",
      autoAudio: true,
      words: UNIT6_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT6_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT6_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT6_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Body Parts",
        words: UNIT6_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Toys",
        words: UNIT6_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 7: We love school! ==========
  {
    slug: "unit-7-we-love-school",
    name: "UNIT 7 – We love school!",
    unit: "Unit 7",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-emerald-50 via-green-50 to-teal-50",
    flashcards: {
      title: "We love school!",
      autoAudio: true,
      words: UNIT7_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT7_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT7_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT7_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Classroom Objects",
        words: UNIT7_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Actions",
        words: UNIT7_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 8: In the playground ==========
  {
    slug: "unit-8-in-the-playground",
    name: "UNIT 8 – In the playground",
    unit: "Unit 8",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-lime-50 via-green-50 to-emerald-50",
    flashcards: {
      title: "In the playground",
      autoAudio: true,
      words: UNIT8_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT8_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT8_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT8_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Sports",
        words: UNIT8_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Actions",
        words: UNIT8_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 9: My hobbies ==========
  {
    slug: "unit-9-my-hobbies",
    name: "UNIT 9 – My hobbies",
    unit: "Unit 9",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-violet-50 via-purple-50 to-fuchsia-50",
    flashcards: {
      title: "My hobbies",
      autoAudio: true,
      words: UNIT9_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT9_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT9_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT9_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Music & Art Hobbies",
        words: UNIT9_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Other Hobbies",
        words: UNIT9_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 10: Your day ==========
  {
    slug: "unit-10-your-day",
    name: "UNIT 10 – Your day",
    unit: "Unit 10",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-orange-50 via-amber-50 to-yellow-50",
    flashcards: {
      title: "Your day",
      autoAudio: true,
      words: UNIT10_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT10_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT10_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT10_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Times of Day",
        words: UNIT10_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Daily Activities",
        words: UNIT10_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 11: In the street ==========
  {
    slug: "unit-11-in-the-street",
    name: "UNIT 11 – In the street",
    unit: "Unit 11",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-slate-50 via-gray-50 to-zinc-50",
    flashcards: {
      title: "In the street",
      autoAudio: true,
      words: UNIT11_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT11_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT11_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT11_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Transport",
        words: UNIT11_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Places",
        words: UNIT11_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 12: My grandparents ==========
  {
    slug: "unit-12-my-grandparents",
    name: "UNIT 12 – My grandparents",
    unit: "Unit 12",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-rose-50 via-pink-50 to-red-50",
    flashcards: {
      title: "My grandparents",
      autoAudio: true,
      words: UNIT12_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT12_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT12_PART1_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT12_PART1_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Garden & Nature",
        words: UNIT12_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 13: Going to the zoo ==========
  {
    slug: "unit-13-going-to-the-zoo",
    name: "UNIT 13 – Going to the zoo",
    unit: "Unit 13",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-green-50 via-lime-50 to-emerald-50",
    flashcards: {
      title: "Going to the zoo",
      autoAudio: true,
      words: UNIT13_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT13_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT13_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT13_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Zoo Animals",
        words: UNIT13_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 14: Happy birthday! ==========
  {
    slug: "unit-14-happy-birthday",
    name: "UNIT 14 – Happy birthday!",
    unit: "Unit 14",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-fuchsia-50 via-pink-50 to-rose-50",
    flashcards: {
      title: "Happy birthday!",
      autoAudio: true,
      words: UNIT14_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT14_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT14_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT14_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Party Items",
        words: UNIT14_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      },
      {
        id: "part2",
        title: "Possessive Pronouns",
        words: UNIT14_PART2_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  },
  // ========== UNIT 15: At the beach ==========
  {
    slug: "unit-15-at-the-beach",
    name: "UNIT 15 – At the beach",
    unit: "Unit 15",
    bookname: "Starter Book",
    useRotatingGame: false,
    backgroundColor: "from-cyan-50 via-sky-50 to-blue-50",
    flashcards: {
      title: "At the beach",
      autoAudio: true,
      words: UNIT15_PART1_WORDS,
    },
    matching: {
      title: "Match words",
      pairs: createMatchingPairs(UNIT15_PART1_WORDS),
    },
    wordOrdering: {
      title: "Word Ordering",
      words: UNIT15_ALL_WORDS,
      showScore: true,
    },
    wordScramble: {
      title: "Word Scramble",
      words: UNIT15_ALL_WORDS,
      showScore: true,
    },
    parts: [
      {
        id: "part1",
        title: "Beach Objects & Nature",
        words: UNIT15_PART1_WORDS,
        enabledGames: ["matching", "flip", "speak"],
      }],
  }]);

/**
 * Tự động generate danh sách projects từ STARTER_BOOK_CONFIG
 */
export function getProjectsFromStarterBook() {
  return STARTER_BOOK_CONFIG.map((unit, index) => ({
    id: unit.slug,
    name: unit.name,
    unitSlug: unit.slug,
  }));
}

/**
 * Lấy unit theo slug
 */
export function getStarterUnitBySlug(slug: string): UnitGameConfig | undefined {
  return STARTER_BOOK_CONFIG.find((unit) => unit.slug === slug);
}

/**
 * Lấy index của unit trong STARTER_BOOK_CONFIG
 */
export function getStarterUnitIndex(slug: string): number {
  return STARTER_BOOK_CONFIG.findIndex((unit) => unit.slug === slug);
}

