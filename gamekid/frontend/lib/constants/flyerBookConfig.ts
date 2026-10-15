import type { UnitGameConfig, WordItem } from "@/types/games";
import { normalizeUnitGameConfigs } from "@/lib/constants/gameConfigHelpers";

// Helpers
// Bổ sung trình bày emoji ổn định hơn bằng cách thêm variation selector (FE0F)
const forceEmoji = (emoji?: string) => (emoji ? `${emoji}\uFE0F` : undefined);

function createMatchingPairs(words: WordItem[]): { left: string; right: string }[] {
  return words.map((w) => ({
    left: forceEmoji(w.emoji) || w.text,
    right: w.meaning || w.text,
  }));
}

// =======================
// Unit 0: Hello! Unit
// =======================
const U0_FAMILY: WordItem[] = [
  { id: "grandpa", text: "grandpa", emoji: "👴", meaning: "Ông" },
  { id: "grandma", text: "grandma", emoji: "👵", meaning: "Bà" },
  { id: "dad", text: "dad", emoji: "👨", meaning: "Bố" },
  { id: "mum", text: "mum", emoji: "👩", meaning: "Mẹ" },
  { id: "cousin", text: "cousin", emoji: "🧑", meaning: "Anh/chị/em họ" },
  { id: "aunt", text: "aunt", emoji: "👩‍🦰", meaning: "Cô/dì/thím" }];
const U0_MISC: WordItem[] = [
  { id: "twins", text: "twins", emoji: "👯", meaning: "Sinh đôi" },
  { id: "surname", text: "surname", emoji: "🪪", meaning: "Họ" },
  { id: "grown_up", text: "grown-up", emoji: "🧑‍💼", meaning: "Người lớn" },
  { id: "married", text: "married", emoji: "💍", meaning: "Đã kết hôn" },
  { id: "grandchildren", text: "grandchildren", emoji: "🧒", meaning: "Cháu" }];
const U0_TIME_NUM: WordItem[] = [
  { id: "january", text: "January", emoji: "❄️", meaning: "Tháng 1" },
  { id: "february", text: "February", emoji: "❄️", meaning: "Tháng 2" },
  { id: "march", text: "March", emoji: "🌱", meaning: "Tháng 3" },
  { id: "april", text: "April", emoji: "🌦️", meaning: "Tháng 4" },
  { id: "may", text: "May", emoji: "🌷", meaning: "Tháng 5" },
  { id: "june", text: "June", emoji: "🌞", meaning: "Tháng 6" },
  { id: "july", text: "July", emoji: "🎆", meaning: "Tháng 7" },
  { id: "august", text: "August", emoji: "🌻", meaning: "Tháng 8" },
  { id: "september", text: "September", emoji: "🍂", meaning: "Tháng 9" },
  { id: "october", text: "October", emoji: "🎃", meaning: "Tháng 10" },
  { id: "november", text: "November", emoji: "🍁", meaning: "Tháng 11" },
  { id: "december", text: "December", emoji: "🎄", meaning: "Tháng 12" },
  { id: "eight_eighty_two", text: "eight hundred and eighty two", emoji: "8️⃣8️⃣2️⃣", meaning: "882" },
  { id: "one_thousand", text: "a thousand", emoji: "1️⃣0️⃣0️⃣0️⃣", meaning: "1000" }];

// =======================
// Unit 1: Our home
// =======================
const U1_ITEMS: WordItem[] = [
  { id: "fridge", text: "fridge", emoji: "🧊", meaning: "Tủ lạnh" },
  { id: "cupboard", text: "cupboard", emoji: "🗄️", meaning: "Tủ chén" },
  { id: "bin", text: "bin", emoji: "🗑️", meaning: "Thùng rác" },
  { id: "oven", text: "oven", emoji: "🔥", meaning: "Lò nướng" },
  { id: "fork", text: "fork", emoji: "🍴", meaning: "Nĩa" },
  { id: "spoon", text: "spoon", emoji: "🥄", meaning: "Muỗng" },
  { id: "mirror", text: "mirror", emoji: "🪞", meaning: "Gương" },
  { id: "dustbin", text: "dustbin", emoji: "🗑️", meaning: "Thùng rác" }];
const U1_PERSONAL: WordItem[] = [
  { id: "shampoo", text: "shampoo", emoji: "🧴", meaning: "Dầu gội" },
  { id: "comb", text: "comb", emoji: "🪮", meaning: "Lược" },
  { id: "brush", text: "brush", emoji: "🪥", meaning: "Bàn chải/Lược" },
  { id: "soap", text: "soap", emoji: "🧼", meaning: "Xà phòng" },
  { id: "necklace", text: "necklace", emoji: "📿", meaning: "Vòng cổ" },
  { id: "stamps", text: "stamps", emoji: "📮", meaning: "Tem" },
  { id: "shower", text: "a shower", emoji: "🚿", meaning: "Vòi sen" },
  { id: "shelf", text: "a shelf", emoji: "🪜", meaning: "Cái kệ" }];
const U1_ADJ: WordItem[] = [
  { id: "empty", text: "empty", emoji: "⭕", meaning: "Rỗng" },
  { id: "broken", text: "broken", emoji: "💔", meaning: "Bị vỡ" },
  { id: "full", text: "full", emoji: "🔵", meaning: "Đầy" },
  { id: "quiet", text: "quiet", emoji: "🤫", meaning: "Yên tĩnh" },
  { id: "noisy", text: "noisy", emoji: "🔊", meaning: "Ồn ào" },
  { id: "tidy", text: "tidy", emoji: "🧹", meaning: "Gọn gàng" },
  { id: "untidy", text: "untidy", emoji: "🌀", meaning: "Bừa bộn" }];
const U1_PRON: WordItem[] = [
  { id: "everyone", text: "everyone", emoji: "👥", meaning: "Mọi người" },
  { id: "everything", text: "everything", emoji: "🎁", meaning: "Mọi thứ" },
  { id: "someone", text: "someone", emoji: "🧑", meaning: "Ai đó" },
  { id: "something", text: "something", emoji: "❓", meaning: "Điều gì đó" },
  { id: "anyone", text: "anyone", emoji: "👤", meaning: "Bất cứ ai" },
  { id: "anything", text: "anything", emoji: "🎲", meaning: "Bất cứ điều gì" },
  { id: "nowhere", text: "nowhere", emoji: "🚫", meaning: "Không nơi nào" },
  { id: "somewhere", text: "somewhere", emoji: "📍", meaning: "Nơi nào đó" },
  { id: "anywhere", text: "anywhere", emoji: "🧭", meaning: "Bất cứ nơi nào" },
  { id: "everywhere", text: "everywhere", emoji: "🌐", meaning: "Mọi nơi" }];
const U1_MISC: WordItem[] = [
  { id: "pyjamas", text: "pyjamas", emoji: "🛌", meaning: "Đồ ngủ" },
  { id: "files", text: "files", emoji: "📁", meaning: "Tài liệu" },
  { id: "wifi", text: "wifi", emoji: "📶", meaning: "Wifi" },
  { id: "trainers", text: "trainers", emoji: "👟", meaning: "Giày thể thao" }];

// =======================
// Unit 2: Going to town
// =======================
const U2_PLACES: WordItem[] = [
  { id: "university", text: "university", emoji: "🎓", meaning: "Trường đại học" },
  { id: "airport", text: "airport", emoji: "✈️", meaning: "Sân bay" },
  { id: "taxi", text: "taxi", emoji: "🚕", meaning: "Taxi" },
  { id: "traffic", text: "traffic", emoji: "🚦", meaning: "Giao thông" },
  { id: "bicycles", text: "bicycles", emoji: "🚲", meaning: "Xe đạp" },
  { id: "ambulance", text: "ambulance", emoji: "🚑", meaning: "Xe cứu thương" },
  { id: "fire_engine", text: "fire engine", emoji: "🚒", meaning: "Xe cứu hỏa" },
  { id: "hotel", text: "hotel", emoji: "🏨", meaning: "Khách sạn" },
  { id: "fire_station", text: "fire station", emoji: "🚒", meaning: "Trạm cứu hỏa" },
  { id: "police_station", text: "police station", emoji: "👮‍♂️", meaning: "Đồn cảnh sát" },
  { id: "railway_station", text: "railway station", emoji: "🚉", meaning: "Ga xe lửa" },
  { id: "motorway", text: "motorway", emoji: "🛣️", meaning: "Đường cao tốc" },
  { id: "museum", text: "museum", emoji: "🏛️", meaning: "Bảo tàng" },
  { id: "factory", text: "factory", emoji: "🏭", meaning: "Nhà máy" },
  { id: "chemists", text: "chemist's", emoji: "💊", meaning: "Hiệu thuốc" },
  { id: "skyscrapers", text: "skyscrapers", emoji: "🏙️", meaning: "Nhà chọc trời" },
  { id: "stadium", text: "stadium", emoji: "🏟️", meaning: "Sân vận động" },
  { id: "post_office", text: "post office", emoji: "📮", meaning: "Bưu điện" },
  { id: "bank", text: "bank", emoji: "🏦", meaning: "Ngân hàng" }];
const U2_TERRAIN: WordItem[] = [
  { id: "sky", text: "sky", emoji: "🌤️", meaning: "Bầu trời" },
  { id: "hills", text: "hills", emoji: "⛰️", meaning: "Đồi" }];
const U2_ADJ_VERB: WordItem[] = [
  { id: "cheap", text: "cheap", emoji: "💲", meaning: "Rẻ" },
  { id: "expensive", text: "expensive", emoji: "💰", meaning: "Đắt" },
  { id: "lovely", text: "lovely", emoji: "😊", meaning: "Đáng yêu" },
  { id: "unhappy", text: "unhappy", emoji: "☹️", meaning: "Buồn" },
  { id: "travelled", text: "travelled", emoji: "🧳", meaning: "Đã đi du lịch" },
  { id: "caught", text: "caught", emoji: "🎣", meaning: "Bắt (QK của catch)" },
  { id: "bought", text: "bought", emoji: "🛒", meaning: "Mua (QK của buy)" },
  { id: "sold", text: "sold", emoji: "💵", meaning: "Bán (QK của sell)" }];

// =======================
// Unit 3: Eating out
// =======================
const U3_FOOD: WordItem[] = [
  { id: "salt", text: "salt", emoji: "🧂", meaning: "Muối" },
  { id: "pizza", text: "pizza", emoji: "🍕", meaning: "Pizza" },
  { id: "butter", text: "butter", emoji: "🧈", meaning: "Bơ" },
  { id: "knife", text: "knife", emoji: "🔪", meaning: "Dao" },
  { id: "pepper", text: "pepper", emoji: "🌶️", meaning: "Hạt tiêu/Ớt" },
  { id: "jam", text: "jam", emoji: "🍓", meaning: "Mứt" },
  { id: "flour", text: "flour", emoji: "🌾", meaning: "Bột mì" },
  { id: "honey", text: "honey", emoji: "🍯", meaning: "Mật ong" },
  { id: "spoon_u3", text: "spoon", emoji: "🥄", meaning: "Muỗng" },
  { id: "sugar", text: "sugar", emoji: "🧁", meaning: "Đường" },
  { id: "yogurt", text: "yogurt", emoji: "🥛", meaning: "Sữa chua" },
  { id: "strawberries", text: "strawberries", emoji: "🍓", meaning: "Dâu tây" },
  { id: "olives", text: "olives", emoji: "🫒", meaning: "Ô-liu" },
  { id: "chopsticks", text: "chopsticks", emoji: "🥢", meaning: "Đũa" },
  { id: "biscuits", text: "biscuits", emoji: "🍪", meaning: "Bánh quy" }];
const U3_ADJ_EMO: WordItem[] = [
  { id: "soft", text: "soft", emoji: "🧸", meaning: "Mềm" },
  { id: "hard", text: "hard", emoji: "🪨", meaning: "Cứng" },
  { id: "dangerous", text: "dangerous", emoji: "⚠️", meaning: "Nguy hiểm" },
  { id: "noisy_u3", text: "noisy", emoji: "🔊", meaning: "Ồn ào" },
  { id: "slow", text: "slow", emoji: "🐢", meaning: "Chậm" },
  { id: "hungry", text: "hungry", emoji: "😋", meaning: "Đói" },
  { id: "bored", text: "bored", emoji: "🥱", meaning: "Buồn chán" },
  { id: "worried", text: "worried", emoji: "😟", meaning: "Lo lắng" },
  { id: "angry", text: "angry", emoji: "😠", meaning: "Giận dữ" },
  { id: "excited", text: "excited", emoji: "🤩", meaning: "Hào hứng" },
  { id: "ill", text: "ill", emoji: "🤒", meaning: "Ốm" },
  { id: "delicious", text: "delicious", emoji: "😋", meaning: "Ngon" },
  { id: "late", text: "late", emoji: "⏰", meaning: "Muộn" }];
const U3_ITEMS: WordItem[] = [
  { id: "hat", text: "hat", emoji: "👒", meaning: "Mũ" },
  { id: "shoes", text: "shoes", emoji: "👟", meaning: "Giày" },
  { id: "tap", text: "tap", emoji: "🚰", meaning: "Vòi nước" },
  { id: "fork_u3", text: "fork", emoji: "🍴", meaning: "Nĩa" },
  { id: "scarf", text: "scarf", emoji: "🧣", meaning: "Khăn quàng cổ" }];

// =======================
// Unit 4: At school
// =======================
const U4_SUBJECTS: WordItem[] = [
  { id: "science", text: "science", emoji: "🔬", meaning: "Khoa học" },
  { id: "geography", text: "geography", emoji: "🗺️", meaning: "Địa lý" },
  { id: "history", text: "history", emoji: "🏺", meaning: "Lịch sử" },
  { id: "sport", text: "sport", emoji: "🏅", meaning: "Thể thao" },
  { id: "languages", text: "languages", emoji: "🗣️", meaning: "Ngoại ngữ" },
  { id: "art", text: "art", emoji: "🎨", meaning: "Mỹ thuật" },
  { id: "music", text: "music", emoji: "🎵", meaning: "Âm nhạc" },
  { id: "maths", text: "maths", emoji: "📐", meaning: "Toán" }];
const U4_TIME: WordItem[] = [
  { id: "am", text: "a.m.", emoji: "🌅", meaning: "Buổi sáng" },
  { id: "pm", text: "p.m.", emoji: "🌙", meaning: "Buổi chiều/tối" },
  { id: "midday", text: "midday", emoji: "🕛", meaning: "12 giờ trưa" },
  { id: "midnight", text: "midnight", emoji: "🌌", meaning: "Nửa đêm" }];
const U4_ADJ_VERB: WordItem[] = [
  { id: "borrow", text: "to borrow", emoji: "🤝", meaning: "Mượn" },
  { id: "improve", text: "to improve", emoji: "📈", meaning: "Cải thiện" },
  { id: "join", text: "to join", emoji: "➕", meaning: "Tham gia" },
  { id: "repeat", text: "to repeat", emoji: "🔁", meaning: "Lặp lại" },
  { id: "teach", text: "to teach", emoji: "👩‍🏫", meaning: "Dạy" },
  { id: "frightened", text: "frightened", emoji: "😨", meaning: "Sợ hãi" },
  { id: "excellent", text: "excellent", emoji: "🌟", meaning: "Xuất sắc" },
  { id: "easy", text: "easy", emoji: "👍", meaning: "Dễ" },
  { id: "difficult", text: "difficult", emoji: "💪", meaning: "Khó" },
  { id: "lazy", text: "lazy", emoji: "😴", meaning: "Lười" }];
const U4_ITEMS_MATERIAL: WordItem[] = [
  { id: "necklace_u4", text: "necklace", emoji: "📿", meaning: "Vòng cổ" },
  { id: "sweater", text: "sweater", emoji: "🧥", meaning: "Áo len" },
  { id: "scarf_u4", text: "scarf", emoji: "🧣", meaning: "Khăn quàng" },
  { id: "toy_duck", text: "toy duck", emoji: "🦆", meaning: "Vịt đồ chơi" },
  { id: "magazine", text: "magazine", emoji: "📖", meaning: "Tạp chí" },
  { id: "shelf_u4", text: "shelf", emoji: "🗄️", meaning: "Kệ" },
  { id: "computer_mouse", text: "computer mouse", emoji: "🖱️", meaning: "Chuột máy tính" },
  { id: "metal", text: "metal", emoji: "⚙️", meaning: "Kim loại" },
  { id: "paper", text: "paper", emoji: "📄", meaning: "Giấy" },
  { id: "wood", text: "wood", emoji: "🪵", meaning: "Gỗ" },
  { id: "wool", text: "wool", emoji: "🧶", meaning: "Len" },
  { id: "plastic", text: "plastic", emoji: "🧴", meaning: "Nhựa" }];

// =======================
// Unit 5: A day out
// =======================
const U5_PLACES: WordItem[] = [
  { id: "cinema", text: "cinema", meaning: "Rạp chiếu phim" },
  { id: "museum_u5", text: "museum", meaning: "Bảo tàng" },
  { id: "theatre_u5", text: "theatre", meaning: "Nhà hát" },
  { id: "circus_u5", text: "circus", meaning: "Rạp xiếc" },
  { id: "zoo", text: "zoo", meaning: "Sở thú" },
  { id: "pyramids", text: "pyramids", meaning: "Kim tự tháp" },
  { id: "jungle", text: "jungle", meaning: "Rừng rậm" }];
const U5_ITEMS: WordItem[] = [
  { id: "seats", text: "seats", meaning: "Chỗ ngồi" },
  { id: "dinosaurs", text: "dinosaurs", meaning: "Khủng long" },
  { id: "actors_u5", text: "actors", meaning: "Diễn viên" },
  { id: "clowns_u5", text: "clowns", meaning: "Chú hề" },
  { id: "wild_animals", text: "wild animals", meaning: "Động vật hoang dã" },
  { id: "screen", text: "screen", meaning: "Màn hình" },
  { id: "cartoons", text: "cartoons", meaning: "Phim hoạt hình" },
  { id: "swing_u5", text: "swing", meaning: "Xích đu" },
  { id: "stage", text: "stage", meaning: "Sân khấu" },
  { id: "cage", text: "cage", meaning: "Cũi/Lồng" }];
const U5_ADJ: WordItem[] = [
  { id: "extinct", text: "extinct", meaning: "Tuyệt chủng" },
  { id: "interesting", text: "interesting", meaning: "Thú vị" },
  { id: "exciting", text: "exciting", meaning: "Hấp dẫn" },
  { id: "excellent", text: "excellent", meaning: "Xuất sắc" },
  { id: "brave_u5", text: "brave", meaning: "Dũng cảm" },
  { id: "expensive", text: "expensive", meaning: "Đắt" },
  { id: "high_u5", text: "high", meaning: "Cao" },
  { id: "bored", text: "bored", meaning: "Chán" }];
const U5_TIME: WordItem[] = [
  { id: "evening", text: "evening", meaning: "Buổi tối" },
  { id: "afternoon", text: "afternoon", meaning: "Buổi chiều" },
  { id: "night", text: "night", meaning: "Buổi đêm" },
  { id: "morning", text: "morning", meaning: "Buổi sáng" }];

// =======================
// Unit 6: Dream jobs
// =======================
const U6_JOBS: WordItem[] = [
  { id: "artist", text: "artist", meaning: "Họa sĩ" },
  { id: "photographer", text: "photographer", meaning: "Thợ ảnh" },
  { id: "teacher_u6", text: "teacher", meaning: "Giáo viên" },
  { id: "manager", text: "manager", meaning: "Quản lý" },
  { id: "singer", text: "singer", meaning: "Ca sĩ" },
  { id: "tennis_player", text: "tennis player", meaning: "Vận động viên quần vợt" },
  { id: "police_officer", text: "police officer", meaning: "Cảnh sát" },
  { id: "designer", text: "designer", meaning: "Nhà thiết kế" },
  { id: "journalist", text: "journalist", meaning: "Nhà báo" },
  { id: "mechanic", text: "mechanic", meaning: "Thợ máy" },
  { id: "dentist", text: "dentist", meaning: "Nha sĩ" },
  { id: "engineer", text: "engineer", meaning: "Kỹ sư" },
  { id: "pilot", text: "pilot", meaning: "Phi công" },
  { id: "waiter", text: "waiter", meaning: "Phục vụ" },
  { id: "doctor", text: "doctor", meaning: "Bác sĩ" },
  { id: "fire_fighter", text: "fire fighter", meaning: "Lính cứu hỏa" },
  { id: "clown_u6", text: "clown", meaning: "Chú hề" },
  { id: "actor_u6", text: "actor", meaning: "Diễn viên" },
  { id: "cook", text: "cook", meaning: "Đầu bếp" }];
const U6_PLACES: WordItem[] = [
  { id: "office", text: "office", meaning: "Văn phòng" },
  { id: "kitchen", text: "kitchen", meaning: "Nhà bếp" },
  { id: "classroom", text: "classroom", meaning: "Phòng học" },
  { id: "police_station_u6", text: "police station", meaning: "Đồn cảnh sát" },
  { id: "restaurant_u6", text: "restaurant", meaning: "Nhà hàng" },
  { id: "airport_u6", text: "airport", meaning: "Sân bay" },
  { id: "hospital", text: "hospital", meaning: "Bệnh viện" },
  { id: "circus_u6", text: "circus", meaning: "Rạp xiếc" },
  { id: "fire_station_u6", text: "fire station", meaning: "Trạm cứu hỏa" },
  { id: "theatre_u6", text: "theatre", meaning: "Nhà hát" },
  { id: "school_u6", text: "school", meaning: "Trường học" },
  { id: "factory_u6", text: "factory", meaning: "Nhà máy" },
  { id: "hotel_u6", text: "hotel", meaning: "Khách sạn" }];
const U6_OTHER: WordItem[] = [
  { id: "ambulance_u6", text: "ambulance", meaning: "Xe cứu thương" },
  { id: "uniform", text: "uniform", meaning: "Đồng phục" }];

// =======================
// Unit 7: At the castle
// =======================
const U7_CASTLE: WordItem[] = [
  { id: "castle", text: "castle", meaning: "Lâu đài" },
  { id: "exit", text: "exit", meaning: "Lối ra" },
  { id: "flag", text: "flag", meaning: "Cờ" },
  { id: "king", text: "king", meaning: "Vua" },
  { id: "gate", text: "gate", meaning: "Cổng" },
  { id: "ring", text: "ring", meaning: "Nhẫn" },
  { id: "queen", text: "queen", meaning: "Nữ hoàng" },
  { id: "costumes", text: "costumes", meaning: "Trang phục" },
  { id: "steps", text: "steps", meaning: "Bậc thang" },
  { id: "postcards", text: "postcards", meaning: "Bưu thiếp" },
  { id: "bridge_u7", text: "bridge", meaning: "Cầu" },
  { id: "swans", text: "swans", meaning: "Thiên nga" },
  { id: "entrance", text: "entrance", meaning: "Lối vào" },
  { id: "swings", text: "swings", meaning: "Xích đu" },
  { id: "river_u7", text: "river", meaning: "Sông" },
  { id: "crown", text: "crown", meaning: "Vương miện" }];
const U7_DIRECTIONS: WordItem[] = [
  { id: "north", text: "north", meaning: "Bắc" },
  { id: "south", text: "south", meaning: "Nam" },
  { id: "east", text: "east", meaning: "Đông" },
  { id: "west", text: "west", meaning: "Tây" },
  { id: "playground", text: "playground", meaning: "Sân chơi" },
  { id: "flower_garden", text: "flower garden", meaning: "Vườn hoa" },
  { id: "insect_house", text: "insect house", meaning: "Nhà côn trùng" },
  { id: "museum_u7", text: "museum", meaning: "Bảo tàng" }];
const U7_ADJ: WordItem[] = [
  { id: "early_u7", text: "early", meaning: "Sớm" },
  { id: "cheap_u7", text: "cheap", meaning: "Rẻ" },
  { id: "high_u7", text: "high", meaning: "Cao" }];

// =======================
// Unit 8: Sports day!
// =======================
const U8_SPORTS: WordItem[] = [
  { id: "volleyball", text: "volleyball", meaning: "Bóng chuyền" },
  { id: "competition", text: "competition", meaning: "Cuộc thi" },
  { id: "race", text: "race", meaning: "Cuộc đua" },
  { id: "golf", text: "golf", meaning: "Gôn" },
  { id: "tennis_u8", text: "tennis", meaning: "Quần vợt" },
  { id: "match", text: "match", meaning: "Trận đấu" },
  { id: "goal", text: "goal", meaning: "Khung thành" },
  { id: "high_jump", text: "high jump", meaning: "Nhảy cao" },
  { id: "football_match", text: "football match", meaning: "Trận bóng đá" }];
const U8_RESULTS: WordItem[] = [
  { id: "winners", text: "winners", meaning: "Người chiến thắng" },
  { id: "prizes", text: "prizes", meaning: "Giải thưởng" },
  { id: "the_score", text: "the score", meaning: "Tỷ số" },
  { id: "scored", text: "scored", meaning: "Đã ghi bàn" },
  { id: "ran", text: "ran", meaning: "Đã chạy" },
  { id: "waited", text: "waited", meaning: "Đã chờ đợi" },
  { id: "smiled", text: "smiled", meaning: "Đã cười" },
  { id: "waved", text: "waved", meaning: "Đã vẫy tay" },
  { id: "won", text: "won", meaning: "Đã thắng" },
  { id: "fell_over", text: "fell over", meaning: "Đã ngã" }];
const U8_PLACE: WordItem[] = [
  { id: "stadium_u8", text: "stadium", meaning: "Sân vận động" }];

// =======================
// Unit 9: Our camping adventure
// =======================
const U9_CAMP: WordItem[] = [
  { id: "stars", text: "stars", meaning: "Các vì sao" },
  { id: "swan_u9", text: "swan", meaning: "Thiên nga" },
  { id: "cave", text: "cave", meaning: "Hang động" },
  { id: "bats", text: "bats", meaning: "Dơi" },
  { id: "rucksack", text: "rucksack", meaning: "Ba lô" },
  { id: "river_u9", text: "river", meaning: "Sông" },
  { id: "tent", text: "tent", meaning: "Lều" },
  { id: "rocks", text: "rocks", meaning: "Đá" },
  { id: "magazine_u9", text: "magazine", meaning: "Tạp chí" },
  { id: "nest", text: "nest", meaning: "Tổ" },
  { id: "moon", text: "moon", meaning: "Mặt trăng" },
  { id: "hills_u9", text: "hills", meaning: "Đồi" },
  { id: "newspaper_u9", text: "newspaper", meaning: "Báo" },
  { id: "torch", text: "torch", meaning: "Đèn pin" },
  { id: "fire", text: "fire", meaning: "Lửa" },
  { id: "umbrella_u9", text: "umbrella", meaning: "Ô" },
  { id: "biscuits_u9", text: "biscuits", meaning: "Bánh quy" },
  { id: "pockets", text: "pockets", meaning: "Túi" }];
const U9_ADJ_VERB: WordItem[] = [
  { id: "deep", text: "deep", meaning: "Sâu" },
  { id: "soft_u9", text: "soft", meaning: "Mềm" },
  { id: "frightening", text: "frightening", meaning: "Đáng sợ" },
  { id: "together", text: "together", meaning: "Cùng nhau" },
  { id: "creature", text: "creature", meaning: "Sinh vật" },
  { id: "sore", text: "sore", meaning: "Đau nhức" },
  { id: "brave_u9", text: "brave", meaning: "Dũng cảm" },
  { id: "living", text: "living", meaning: "Đang sống" },
  { id: "was_crying", text: "was crying", meaning: "Đang khóc" },
  { id: "was_raining", text: "was raining", meaning: "Trời đang mưa" },
  { id: "were_shouting", text: "were shouting", meaning: "Đang la hét" }];

// =======================
// Unit 10: A good year!
// =======================
const U10_ACTIVITIES: WordItem[] = [
  { id: "climbing", text: "climbing", meaning: "Leo núi" },
  { id: "riding", text: "riding", meaning: "Cưỡi" },
  { id: "buying", text: "buying", meaning: "Mua" },
  { id: "walking", text: "walking", meaning: "Đi bộ" },
  { id: "collecting", text: "collecting", meaning: "Thu thập" },
  { id: "flying_u10", text: "flying", meaning: "Thả diều/Bay" },
  { id: "eating", text: "eating", meaning: "Ăn" },
  { id: "skiing", text: "skiing", meaning: "Trượt tuyết" },
  { id: "snowboarding", text: "snowboarding", meaning: "Trượt ván tuyết" },
  { id: "throwing", text: "throwing", meaning: "Ném" },
  { id: "making", text: "making", meaning: "Làm" }];
const U10_SEASONS: WordItem[] = [
  { id: "spring", text: "Spring", meaning: "Xuân" },
  { id: "summer", text: "Summer", meaning: "Hè" },
  { id: "autumn", text: "Autumn", meaning: "Thu" },
  { id: "winter", text: "Winter", meaning: "Đông" },
  { id: "snowballs", text: "snowballs", meaning: "Bóng tuyết" },
  { id: "leaves", text: "leaves", meaning: "Lá" },
  { id: "new_clothes", text: "new clothes", meaning: "Quần áo mới" },
  { id: "woods", text: "woods", meaning: "Rừng" },
  { id: "beach", text: "beach", meaning: "Bãi biển" },
  { id: "snowman", text: "snowman", meaning: "Người tuyết" },
  { id: "vegetables", text: "vegetables", meaning: "Rau củ" }];
const U10_CULTURE: WordItem[] = [
  { id: "museum_u10", text: "museum", meaning: "Bảo tàng" },
  { id: "pyramids_u10", text: "pyramids", meaning: "Kim tự tháp" },
  { id: "camel", text: "camel", meaning: "Lạc đà" },
  { id: "egypt", text: "Egypt", meaning: "Ai Cập" },
  { id: "sphinx", text: "Sphinx", meaning: "Nhân Sư" }];

// =======================
// Unit 11: Our summer holidays
// =======================
const U11_ITEMS: WordItem[] = [
  { id: "gloves", text: "gloves", meaning: "Găng tay" },
  { id: "shorts", text: "shorts", meaning: "Quần đùi" },
  { id: "lemon", text: "lemon", meaning: "Chanh" },
  { id: "pyjamas_u11", text: "pyjamas", meaning: "Đồ ngủ" },
  { id: "belt", text: "belt", meaning: "Thắt lưng" },
  { id: "magazine_u11", text: "magazine", meaning: "Tạp chí" },
  { id: "sunglasses", text: "sunglasses", meaning: "Kính râm" },
  { id: "umbrella_u11", text: "umbrella", meaning: "Ô" },
  { id: "trainers_u11", text: "trainers", meaning: "Giày thể thao" }];
const U11_PLACES: WordItem[] = [
  { id: "stairs", text: "stairs", meaning: "Cầu thang" },
  { id: "pool", text: "pool", meaning: "Hồ bơi" },
  { id: "bed", text: "bed", meaning: "Giường" },
  { id: "restaurant_u11", text: "restaurant", meaning: "Nhà hàng" },
  { id: "bus", text: "bus", meaning: "Xe buýt" },
  { id: "desert", text: "desert", meaning: "Sa mạc" }];
const U11_ADJ_ACTION: WordItem[] = [
  { id: "lazy", text: "lazy", meaning: "Lười biếng" },
  { id: "warm", text: "warm", meaning: "Ấm áp" },
  { id: "crying", text: "crying", meaning: "Khóc" },
  { id: "hurting", text: "hurting", meaning: "Đau" },
  { id: "riding_u11", text: "riding", meaning: "Cưỡi" }];

// =======================
// Unit 12: Past and future
// =======================
const U12_TIME_HISTORY: WordItem[] = [
  { id: "century", text: "century", meaning: "Thế kỷ" },
  { id: "newspapers", text: "newspapers", meaning: "Báo chí" },
  { id: "actors_u12", text: "actors", meaning: "Diễn viên" },
  { id: "fire_fighters", text: "fire fighters", meaning: "Lính cứu hỏa" },
  { id: "fire_engines", text: "fire engines", meaning: "Xe cứu hỏa" }];
const U12_SPACE: WordItem[] = [
  { id: "spaceships", text: "spaceships", meaning: "Tàu vũ trụ" },
  { id: "rockets", text: "rockets", meaning: "Tên lửa" },
  { id: "planet", text: "planet", meaning: "Hành tinh" },
  { id: "aliens", text: "aliens", meaning: "Người ngoài hành tinh" },
  { id: "moons", text: "moons", meaning: "Mặt trăng" },
  { id: "temperature", text: "temperature", meaning: "Nhiệt độ" }];
const U12_VERBS: WordItem[] = [
  { id: "visit", text: "visit", meaning: "Thăm" },
  { id: "live", text: "live", meaning: "Sống" },
  { id: "fly", text: "fly", meaning: "Bay" },
  { id: "learn", text: "learn", meaning: "Học" },
  { id: "invent", text: "invent", meaning: "Phát minh" }];

// ============================================
// FLYER BOOK CONFIG
// ============================================

export const FLYER_BOOK_CONFIG: (UnitGameConfig & { backgroundColor?: string })[] = normalizeUnitGameConfigs([
  {
    slug: "unit-0-hello",
    name: "HELLO UNIT",
    unit: "Unit 0",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-purple-50 via-indigo-50 to-blue-50",
    flashcards: { title: "Hello!", autoAudio: true, words: U0_FAMILY },
    matching: { title: "Match words", pairs: createMatchingPairs(U0_FAMILY) },
    wordOrdering: { title: "Word Ordering", words: [...U0_FAMILY, ...U0_MISC, ...U0_TIME_NUM], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U0_FAMILY, ...U0_MISC, ...U0_TIME_NUM], showScore: true },
    parts: [
      { id: "part-1-family", title: "Family", words: U0_FAMILY },
      { id: "part-2-misc", title: "More family words", words: U0_MISC },
      { id: "part-3-time-number", title: "Months & numbers", words: U0_TIME_NUM }],
  },
  {
    slug: "unit-1-our-home",
    name: "UNIT 1 – Our home",
    unit: "Unit 1",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-amber-50 via-orange-50 to-yellow-50",
    flashcards: { title: "Our home", autoAudio: true, words: U1_ITEMS },
    matching: { title: "Match words", pairs: createMatchingPairs(U1_ITEMS) },
    wordOrdering: { title: "Word Ordering", words: [...U1_ITEMS, ...U1_PERSONAL, ...U1_ADJ, ...U1_PRON, ...U1_MISC], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U1_ITEMS, ...U1_PERSONAL, ...U1_ADJ, ...U1_PRON, ...U1_MISC], showScore: true },
    parts: [
      { id: "part-1-items", title: "House items", words: U1_ITEMS },
      { id: "part-2-personal", title: "Personal items", words: U1_PERSONAL },
      { id: "part-3-adjectives", title: "Adjectives & states", words: U1_ADJ },
      { id: "part-4-pronouns", title: "Pronouns", words: U1_PRON },
      { id: "part-5-misc", title: "Misc", words: U1_MISC }],
  },
  {
    slug: "unit-2-going-to-town",
    name: "UNIT 2 – Going to town",
    unit: "Unit 2",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-sky-50 via-blue-50 to-cyan-50",
    flashcards: { title: "Going to town", autoAudio: true, words: U2_PLACES },
    matching: { title: "Match words", pairs: createMatchingPairs(U2_PLACES) },
    wordOrdering: { title: "Word Ordering", words: [...U2_PLACES, ...U2_TERRAIN, ...U2_ADJ_VERB], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U2_PLACES, ...U2_TERRAIN, ...U2_ADJ_VERB], showScore: true },
    parts: [
      { id: "part-1-places-transport", title: "Places & transport", words: U2_PLACES },
      { id: "part-2-terrain", title: "Terrain", words: U2_TERRAIN },
      { id: "part-3-adj-verb", title: "Adjectives & verbs", words: U2_ADJ_VERB }],
  },
  {
    slug: "unit-3-eating-out",
    name: "UNIT 3 – Eating out",
    unit: "Unit 3",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-rose-50 via-pink-50 to-orange-50",
    flashcards: { title: "Eating out", autoAudio: true, words: U3_FOOD },
    matching: { title: "Match words", pairs: createMatchingPairs(U3_FOOD) },
    wordOrdering: { title: "Word Ordering", words: [...U3_FOOD, ...U3_ADJ_EMO, ...U3_ITEMS], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U3_FOOD, ...U3_ADJ_EMO, ...U3_ITEMS], showScore: true },
    parts: [
      { id: "part-1-food", title: "Food & spices", words: U3_FOOD },
      { id: "part-2-adj", title: "Adjectives & feelings", words: U3_ADJ_EMO },
      { id: "part-3-items", title: "Items", words: U3_ITEMS }],
  },
  {
    slug: "unit-4-at-school",
    name: "UNIT 4 – At school",
    unit: "Unit 4",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-green-50 via-lime-50 to-emerald-50",
    flashcards: { title: "At school", autoAudio: true, words: U4_SUBJECTS },
    matching: { title: "Match words", pairs: createMatchingPairs(U4_SUBJECTS) },
    wordOrdering: { title: "Word Ordering", words: [...U4_SUBJECTS, ...U4_TIME, ...U4_ADJ_VERB, ...U4_ITEMS_MATERIAL], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U4_SUBJECTS, ...U4_TIME, ...U4_ADJ_VERB, ...U4_ITEMS_MATERIAL], showScore: true },
    parts: [
      { id: "part-1-subjects", title: "Subjects", words: U4_SUBJECTS },
      { id: "part-2-time", title: "Time words", words: U4_TIME },
      { id: "part-3-adj-verb", title: "Adjectives & verbs", words: U4_ADJ_VERB },
      { id: "part-4-items-material", title: "Items & materials", words: U4_ITEMS_MATERIAL }],
  },
  {
    slug: "unit-5-a-day-out",
    name: "UNIT 5 – A day out",
    unit: "Unit 5",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-blue-50 via-indigo-50 to-purple-50",
    flashcards: { title: "A day out", autoAudio: true, words: U5_PLACES },
    matching: { title: "Match words", pairs: createMatchingPairs(U5_PLACES) },
    wordOrdering: { title: "Word Ordering", words: [...U5_PLACES, ...U5_ITEMS, ...U5_ADJ, ...U5_TIME], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U5_PLACES, ...U5_ITEMS, ...U5_ADJ, ...U5_TIME], showScore: true },
    parts: [
      { id: "part-1-places-fun", title: "Places & Fun", words: U5_PLACES },
      { id: "part-2-related", title: "Related things", words: U5_ITEMS },
      { id: "part-3-adj", title: "Adjectives", words: U5_ADJ },
      { id: "part-4-time", title: "Time of day", words: U5_TIME }],
  },
  {
    slug: "unit-6-dream-jobs",
    name: "UNIT 6 – Dream jobs",
    unit: "Unit 6",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-yellow-50 via-amber-50 to-orange-50",
    flashcards: { title: "Dream jobs", autoAudio: true, words: U6_JOBS },
    matching: { title: "Match words", pairs: createMatchingPairs(U6_JOBS) },
    wordOrdering: { title: "Word Ordering", words: [...U6_JOBS, ...U6_PLACES, ...U6_OTHER], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U6_JOBS, ...U6_PLACES, ...U6_OTHER], showScore: true },
    parts: [
      { id: "part-1-jobs", title: "Jobs", words: U6_JOBS },
      { id: "part-2-workplaces", title: "Workplaces", words: U6_PLACES },
      { id: "part-3-other", title: "Other", words: U6_OTHER }],
  },
  {
    slug: "unit-7-at-the-castle",
    name: "UNIT 7 – At the castle",
    unit: "Unit 7",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-emerald-50 via-teal-50 to-cyan-50",
    flashcards: { title: "At the castle", autoAudio: true, words: U7_CASTLE },
    matching: { title: "Match words", pairs: createMatchingPairs(U7_CASTLE) },
    wordOrdering: { title: "Word Ordering", words: [...U7_CASTLE, ...U7_DIRECTIONS, ...U7_ADJ], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U7_CASTLE, ...U7_DIRECTIONS, ...U7_ADJ], showScore: true },
    parts: [
      { id: "part-1-castle", title: "Castle & Environment", words: U7_CASTLE },
      { id: "part-2-directions", title: "Places & Directions", words: U7_DIRECTIONS },
      { id: "part-3-adj", title: "Adverbs & Adjectives", words: U7_ADJ }],
  },
  {
    slug: "unit-8-sports-day",
    name: "UNIT 8 – Sports day!",
    unit: "Unit 8",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-indigo-50 via-slate-50 to-sky-50",
    flashcards: { title: "Sports day!", autoAudio: true, words: U8_SPORTS },
    matching: { title: "Match words", pairs: createMatchingPairs(U8_SPORTS) },
    wordOrdering: { title: "Word Ordering", words: [...U8_SPORTS, ...U8_RESULTS, ...U8_PLACE], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U8_SPORTS, ...U8_RESULTS, ...U8_PLACE], showScore: true },
    parts: [
      { id: "part-1-sports", title: "Sports & Competitions", words: U8_SPORTS },
      { id: "part-2-results", title: "Results & Actions", words: U8_RESULTS },
      { id: "part-3-place", title: "Place", words: U8_PLACE }],
  },
  {
    slug: "unit-9-camping-adventure",
    name: "UNIT 9 – Our camping adventure",
    unit: "Unit 9",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-lime-50 via-emerald-50 to-green-50",
    flashcards: { title: "Camping adventure", autoAudio: true, words: U9_CAMP },
    matching: { title: "Match words", pairs: createMatchingPairs(U9_CAMP) },
    wordOrdering: { title: "Word Ordering", words: [...U9_CAMP, ...U9_ADJ_VERB], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U9_CAMP, ...U9_ADJ_VERB], showScore: true },
    parts: [
      { id: "part-1-camp", title: "Camping & Nature", words: U9_CAMP },
      { id: "part-2-adjverb", title: "Adjectives & Verbs", words: U9_ADJ_VERB }],
  },
  {
    slug: "unit-10-a-good-year",
    name: "UNIT 10 – A good year!",
    unit: "Unit 10",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-orange-50 via-amber-50 to-yellow-50",
    flashcards: { title: "A good year", autoAudio: true, words: U10_ACTIVITIES },
    matching: { title: "Match words", pairs: createMatchingPairs(U10_ACTIVITIES) },
    wordOrdering: { title: "Word Ordering", words: [...U10_ACTIVITIES, ...U10_SEASONS, ...U10_CULTURE], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U10_ACTIVITIES, ...U10_SEASONS, ...U10_CULTURE], showScore: true },
    parts: [
      { id: "part-1-activities", title: "Seasonal activities", words: U10_ACTIVITIES },
      { id: "part-2-seasons", title: "Seasons & nature", words: U10_SEASONS },
      { id: "part-3-culture", title: "Places & culture", words: U10_CULTURE }],
  },
  {
    slug: "unit-11-summer-holidays",
    name: "UNIT 11 – Our summer holidays",
    unit: "Unit 11",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-cyan-50 via-sky-50 to-blue-50",
    flashcards: { title: "Summer holidays", autoAudio: true, words: U11_ITEMS },
    matching: { title: "Match words", pairs: createMatchingPairs(U11_ITEMS) },
    wordOrdering: { title: "Word Ordering", words: [...U11_ITEMS, ...U11_PLACES, ...U11_ADJ_ACTION], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U11_ITEMS, ...U11_PLACES, ...U11_ADJ_ACTION], showScore: true },
    parts: [
      { id: "part-1-items", title: "Items / Clothes", words: U11_ITEMS },
      { id: "part-2-places", title: "Places", words: U11_PLACES },
      { id: "part-3-adj-action", title: "Adjectives & Actions", words: U11_ADJ_ACTION }],
  },
  {
    slug: "unit-12-past-and-future",
    name: "UNIT 12 – Past and future",
    unit: "Unit 12",
    bookname: "Flyer Book",
    useRotatingGame: true,
    backgroundColor: "from-slate-50 via-gray-50 to-zinc-50",
    flashcards: { title: "Past & future", autoAudio: true, words: U12_TIME_HISTORY },
    matching: { title: "Match words", pairs: createMatchingPairs(U12_TIME_HISTORY) },
    wordOrdering: { title: "Word Ordering", words: [...U12_TIME_HISTORY, ...U12_SPACE, ...U12_VERBS], showScore: true },
    wordScramble: { title: "Word Scramble", words: [...U12_TIME_HISTORY, ...U12_SPACE, ...U12_VERBS], showScore: true },
    parts: [
      { id: "part-1-time-history", title: "Time & History", words: U12_TIME_HISTORY },
      { id: "part-2-space", title: "Space & Future", words: U12_SPACE },
      { id: "part-3-verbs", title: "Verbs", words: U12_VERBS }],
  }]);

export function getProjectsFromFlyerBook() {
  return FLYER_BOOK_CONFIG.map((unit) => ({
    id: unit.slug,
    name: unit.name,
    unitSlug: unit.slug,
  }));
}

export function getFlyerUnitBySlug(slug: string): UnitGameConfig | undefined {
  return FLYER_BOOK_CONFIG.find((u) => u.slug === slug);
}

export function getFlyerUnitIndex(slug: string): number {
  return FLYER_BOOK_CONFIG.findIndex((u) => u.slug === slug);
}

