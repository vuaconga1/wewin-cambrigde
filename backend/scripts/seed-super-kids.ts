import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { GameUnit } from '../src/entities/game/game-unit.entity';

dotenv.config({ path: path.join(__dirname, '../.env') });

type SeedWord = { id: string; text: string; meaning: string };

const imagePath = (week: string, id: string) => `/assets/super-kids/${week}/${id}.png`;

const toWords = (week: string, words: SeedWord[]) =>
  words.map((word) => ({ ...word, icon: imagePath(week, word.id) }));

// WEEK 1
const WEEK_1_LESSON_1 = toWords('week-1', [
  { id: 'america', text: 'America', meaning: 'Nước Mỹ' },
  { id: 'england', text: 'England', meaning: 'Nước Anh' },
  { id: 'italy', text: 'Italy', meaning: 'Nước Ý' },
  { id: 'france', text: 'France', meaning: 'Nước Pháp' },
  { id: 'canada', text: 'Canada', meaning: 'Nước Canada' },
  { id: 'russia', text: 'Russia', meaning: 'Nước Nga' },
]);
const WEEK_1_LESSON_2 = toWords('week-1', [
  { id: 'japan', text: 'Japan', meaning: 'Nước Nhật Bản' },
  { id: 'vietnam', text: 'Vietnam', meaning: 'Việt Nam' },
  { id: 'china', text: 'China', meaning: 'Trung Quốc' },
  { id: 'korea', text: 'Korea', meaning: 'Hàn Quốc' },
  { id: 'india', text: 'India', meaning: 'Ấn Độ' },
]);
const WEEK_1_WORDS = [...WEEK_1_LESSON_1, ...WEEK_1_LESSON_2];

// WEEK 3
const WEEK_3_LESSON_1 = toWords('week-3', [
  { id: 'sun', text: 'Sun', meaning: 'Mặt Trời' },
  { id: 'moon', text: 'Moon', meaning: 'Mặt Trăng' },
  { id: 'mercury', text: 'Mercury', meaning: 'Sao Thủy' },
  { id: 'venus', text: 'Venus', meaning: 'Sao Kim' },
  { id: 'earth', text: 'Earth', meaning: 'Trái Đất' },
]);
const WEEK_3_LESSON_2 = toWords('week-3', [
  { id: 'mars', text: 'Mars', meaning: 'Sao Hỏa' },
  { id: 'jupiter', text: 'Jupiter', meaning: 'Sao Mộc' },
  { id: 'saturn', text: 'Saturn', meaning: 'Sao Thổ' },
  { id: 'uranus', text: 'Uranus', meaning: 'Sao Thiên Vương' },
  { id: 'neptune', text: 'Neptune', meaning: 'Sao Hải Vương' },
]);
const WEEK_3_WORDS = [...WEEK_3_LESSON_1, ...WEEK_3_LESSON_2];

// WEEK 5
const WEEK_5_LESSON_1 = toWords('week-5', [
  { id: 'sofa', text: 'Sofa', meaning: 'Ghế sô-pha' },
  { id: 'tv', text: 'TV', meaning: 'Ti-vi' },
  { id: 'radio', text: 'Radio', meaning: 'Đài radio' },
  { id: 'clock', text: 'Clock', meaning: 'Đồng hồ' },
  { id: 'pillow', text: 'Pillow', meaning: 'Cái gối' },
]);
const WEEK_5_LESSON_2 = toWords('week-5', [
  { id: 'bed', text: 'Bed', meaning: 'Cái giường' },
  { id: 'door', text: 'Door', meaning: 'Cửa ra vào' },
  { id: 'lamp', text: 'Lamp', meaning: 'Đèn bàn' },
  { id: 'window', text: 'Window', meaning: 'Cửa sổ' },
  { id: 'telephone', text: 'Telephone', meaning: 'Điện thoại' },
]);
const WEEK_5_WORDS = [...WEEK_5_LESSON_1, ...WEEK_5_LESSON_2];

// WEEK 7
const WEEK_7_LESSON_1 = toWords('week-7', [
  { id: 'soap', text: 'Soap', meaning: 'Xà phòng' },
  { id: 'towel', text: 'Towel', meaning: 'Khăn tắm' },
  { id: 'shampoo', text: 'Shampoo', meaning: 'Dầu gội' },
  { id: 'mirror', text: 'Mirror', meaning: 'Cái gương' },
  { id: 'toothbrush', text: 'Toothbrush', meaning: 'Bàn chải' },
]);
const WEEK_7_LESSON_2 = toWords('week-7', [
  { id: 'toothpaste', text: 'Toothpaste', meaning: 'Kem đánh răng' },
  { id: 'toilet', text: 'Toilet', meaning: 'Bồn cầu' },
  { id: 'sink', text: 'Sink', meaning: 'Bồn rửa mặt' },
  { id: 'shower', text: 'Shower', meaning: 'Vòi hoa sen' },
  { id: 'bath', text: 'Bath', meaning: 'Bồn tắm' },
]);
const WEEK_7_WORDS = [...WEEK_7_LESSON_1, ...WEEK_7_LESSON_2];

// WEEK 9
const WEEK_9_LESSON_1 = toWords('week-9', [
  { id: 'happy', text: 'Happy', meaning: 'Vui vẻ' },
  { id: 'sad', text: 'Sad', meaning: 'Buồn bã' },
  { id: 'angry', text: 'Angry', meaning: 'Tức giận' },
  { id: 'sleepy', text: 'Sleepy', meaning: 'Buồn ngủ' },
  { id: 'tired', text: 'Tired', meaning: 'Mệt mỏi' },
]);
const WEEK_9_LESSON_2 = toWords('week-9', [
  { id: 'scared', text: 'Scared', meaning: 'Sợ hãi' },
  { id: 'silly', text: 'Silly', meaning: 'Ngộ nghĩnh' },
  { id: 'nervous', text: 'Nervous', meaning: 'Lo lắng' },
  { id: 'surprised', text: 'Surprised', meaning: 'Ngạc nhiên' },
  { id: 'excited', text: 'Excited', meaning: 'Hào hứng' },
]);
const WEEK_9_WORDS = [...WEEK_9_LESSON_1, ...WEEK_9_LESSON_2];

// WEEK 11
const WEEK_11_LESSON_1 = toWords('week-11', [
  { id: 'soccer', text: 'Soccer', meaning: 'Bóng đá' },
  { id: 'badminton', text: 'Badminton', meaning: 'Cầu lông' },
  { id: 'basketball', text: 'Basketball', meaning: 'Bóng rổ' },
  { id: 'tennis', text: 'Tennis', meaning: 'Quần vợt' },
]);
const WEEK_11_LESSON_2 = toWords('week-11', [
  { id: 'boxing', text: 'Boxing', meaning: 'Đấm bốc' },
  { id: 'running', text: 'Running', meaning: 'Chạy bộ' },
  { id: 'cycling', text: 'Cycling', meaning: 'Đạp xe' },
  { id: 'skiing', text: 'Skiing', meaning: 'Trượt tuyết' },
]);
const WEEK_11_WORDS = [...WEEK_11_LESSON_1, ...WEEK_11_LESSON_2];

// WEEK 13
const WEEK_13_LESSON_1 = toWords('week-13', [
  { id: 'swimming', text: 'Swimming', meaning: 'Bơi lội' },
  { id: 'surfing', text: 'Surfing', meaning: 'Lướt sóng' },
  { id: 'windsurfing', text: 'Windsurfing', meaning: 'Lướt ván buồm' },
  { id: 'sailing', text: 'Sailing', meaning: 'Thuyền buồm' },
]);
const WEEK_13_LESSON_2 = toWords('week-13', [
  { id: 'fishing', text: 'Fishing', meaning: 'Câu cá' },
  { id: 'snorkeling', text: 'Snorkeling', meaning: 'Lặn ống thở' },
  { id: 'kayaking', text: 'Kayaking', meaning: 'Chèo thuyền kayak' },
  { id: 'diving', text: 'Diving', meaning: 'Lặn biển' },
]);
const WEEK_13_WORDS = [...WEEK_13_LESSON_1, ...WEEK_13_LESSON_2];

// WEEK 15
const WEEK_15_LESSON_1 = toWords('week-15', [
  { id: 'fast', text: 'Fast', meaning: 'Nhanh' },
  { id: 'slow', text: 'Slow', meaning: 'Chậm' },
  { id: 'big', text: 'Big', meaning: 'To, lớn' },
  { id: 'small', text: 'Small', meaning: 'Nhỏ, bé' },
  { id: 'long', text: 'Long', meaning: 'Dài' },
  { id: 'short', text: 'Short', meaning: 'Ngắn' },
]);
const WEEK_15_LESSON_2 = toWords('week-15', [
  { id: 'hot', text: 'Hot', meaning: 'Nóng' },
  { id: 'cold', text: 'Cold', meaning: 'Lạnh' },
  { id: 'dry', text: 'Dry', meaning: 'Khô ráo' },
  { id: 'wet', text: 'Wet', meaning: 'Ướt' },
  { id: 'old', text: 'Old', meaning: 'Già, cũ' },
  { id: 'young', text: 'Young', meaning: 'Trẻ' },
]);
const WEEK_15_WORDS = [...WEEK_15_LESSON_1, ...WEEK_15_LESSON_2];

// WEEK 17
const WEEK_17_LESSON_1 = toWords('week-17', [
  { id: 'santa', text: 'Santa', meaning: 'Ông già Noel' },
  { id: 'elf', text: 'Elf', meaning: 'Chú lùn' },
  { id: 'present', text: 'Present', meaning: 'Hộp quà' },
  { id: 'christmas-tree', text: 'Christmas tree', meaning: 'Cây thông Noel' },
  { id: 'reindeer', text: 'Reindeer', meaning: 'Con tuần lộc' },
]);
const WEEK_17_LESSON_2 = toWords('week-17', [
  { id: 'snowman', text: 'Snowman', meaning: 'Người tuyết' },
  { id: 'jingle-bell', text: 'Jingle bell', meaning: 'Chuông Giáng sinh' },
  { id: 'candy-cane', text: 'Candy cane', meaning: 'Kẹo gậy' },
  { id: 'snowball', text: 'Snowball', meaning: 'Quả bóng tuyết' },
  { id: 'stocking', text: 'Stocking', meaning: 'Chiếc tất Giáng sinh' },
]);
const WEEK_17_WORDS = [...WEEK_17_LESSON_1, ...WEEK_17_LESSON_2];

// WEEK 19
const WEEK_19_LESSON_1 = toWords('week-19', [
  { id: 'teacher', text: 'Teacher', meaning: 'Giáo viên' },
  { id: 'doctor', text: 'Doctor', meaning: 'Bác sĩ' },
  { id: 'pilot', text: 'Pilot', meaning: 'Phi công' },
  { id: 'police-officer', text: 'Police officer', meaning: 'Cảnh sát' },
  { id: 'firefighter', text: 'Firefighter', meaning: 'Lính cứu hỏa' },
]);
const WEEK_19_LESSON_2 = toWords('week-19', [
  { id: 'school', text: 'School', meaning: 'Trường học' },
  { id: 'hospital', text: 'Hospital', meaning: 'Bệnh viện' },
  { id: 'airport', text: 'Airport', meaning: 'Sân bay' },
  { id: 'police-station', text: 'Police station', meaning: 'Đồn cảnh sát' },
  { id: 'fire-station', text: 'Fire station', meaning: 'Trạm cứu hỏa' },
]);
const WEEK_19_WORDS = [...WEEK_19_LESSON_1, ...WEEK_19_LESSON_2];

// WEEK 21
const WEEK_21_LESSON_1 = toWords('week-21', [
  { id: 'stand-up', text: 'Stand up', meaning: 'Đứng lên' },
  { id: 'sit-down', text: 'Sit down', meaning: 'Ngồi xuống' },
  { id: 'open', text: 'Open', meaning: 'Mở ra' },
  { id: 'close', text: 'Close', meaning: 'Đóng lại' },
]);
const WEEK_21_LESSON_2 = toWords('week-21', [
  { id: 'sleep', text: 'Sleep', meaning: 'Ngủ' },
  { id: 'laugh', text: 'Laugh', meaning: 'Cười' },
  { id: 'cry', text: 'Cry', meaning: 'Khóc' },
  { id: 'cut', text: 'Cut', meaning: 'Cắt' },
]);
const WEEK_21_WORDS = [...WEEK_21_LESSON_1, ...WEEK_21_LESSON_2];

// WEEK 23
const WEEK_23_LESSON_1 = toWords('week-23', [
  { id: 'in', text: 'In', meaning: 'Ở trong' },
  { id: 'on', text: 'On', meaning: 'Ở trên' },
  { id: 'under', text: 'Under', meaning: 'Ở dưới' },
  { id: 'next-to', text: 'Next to', meaning: 'Bên cạnh' },
  { id: 'behind', text: 'Behind', meaning: 'Ở phía sau' },
]);
const WEEK_23_LESSON_2 = toWords('week-23', [
  { id: 'in-front-of', text: 'In front of', meaning: 'Ở phía trước' },
  { id: 'between', text: 'Between', meaning: 'Ở giữa' },
  { id: 'above', text: 'Above', meaning: 'Ở phía trên' },
  { id: 'below', text: 'Below', meaning: 'Ở phía dưới' },
]);
const WEEK_23_WORDS = [...WEEK_23_LESSON_1, ...WEEK_23_LESSON_2];

// WEEK 25
const WEEK_25_LESSON_1 = toWords('week-25', [
  { id: 'rat', text: 'Rat', meaning: 'Con chuột' },
  { id: 'dragon', text: 'Dragon', meaning: 'Con rồng' },
  { id: 'goat', text: 'Goat', meaning: 'Con dê' },
  { id: 'rooster', text: 'Rooster', meaning: 'Con gà trống' },
  { id: 'snake', text: 'Snake', meaning: 'Con rắn' },
  { id: 'horse', text: 'Horse', meaning: 'Con ngựa' },
]);
const WEEK_25_LESSON_2 = toWords('week-25', [
  { id: 'tiger', text: 'Tiger', meaning: 'Con hổ' },
  { id: 'ox', text: 'Ox', meaning: 'Con trâu / Con bò' },
  { id: 'monkey', text: 'Monkey', meaning: 'Con khỉ' },
  { id: 'pig', text: 'Pig', meaning: 'Con lợn' },
  { id: 'cat', text: 'Cat', meaning: 'Con mèo' },
  { id: 'dog', text: 'Dog', meaning: 'Con chó' },
]);
const WEEK_25_WORDS = [...WEEK_25_LESSON_1, ...WEEK_25_LESSON_2];

// WEEK 27
const WEEK_27_LESSON_1 = toWords('week-27', [
  { id: 'mushroom', text: 'Mushroom', meaning: 'Nấm' },
  { id: 'carrot', text: 'Carrot', meaning: 'Cà rốt' },
  { id: 'bean', text: 'Bean', meaning: 'Hạt đậu' },
  { id: 'potato', text: 'Potato', meaning: 'Khoai tây' },
]);
const WEEK_27_LESSON_2 = toWords('week-27', [
  { id: 'cabbage', text: 'Cabbage', meaning: 'Bắp cải' },
  { id: 'tomato', text: 'Tomato', meaning: 'Cà chua' },
  { id: 'corn', text: 'Corn', meaning: 'Bắp ngô' },
  { id: 'broccoli', text: 'Broccoli', meaning: 'Bông cải xanh' },
]);
const WEEK_27_WORDS = [...WEEK_27_LESSON_1, ...WEEK_27_LESSON_2];

// WEEK 29
const WEEK_29_LESSON_1 = toWords('week-29', [
  { id: 'cucumber', text: 'Cucumber', meaning: 'Dưa chuột' },
  { id: 'onion', text: 'Onion', meaning: 'Củ hành tây' },
  { id: 'eggplant', text: 'Eggplant', meaning: 'Cà tím' },
  { id: 'garlic', text: 'Garlic', meaning: 'Củ tỏi' },
  { id: 'ginger', text: 'Ginger', meaning: 'Củ gừng' },
]);
const WEEK_29_LESSON_2 = toWords('week-29', [
  { id: 'bell-pepper', text: 'Bell pepper', meaning: 'Ớt chuông' },
  { id: 'beetroot', text: 'Beetroot', meaning: 'Củ dền' },
  { id: 'lettuce', text: 'Lettuce', meaning: 'Rau xà lách' },
  { id: 'green-onion', text: 'Green onion', meaning: 'Hành lá' },
  { id: 'celery', text: 'Celery', meaning: 'Cần tây' },
]);
const WEEK_29_WORDS = [...WEEK_29_LESSON_1, ...WEEK_29_LESSON_2];

// WEEK 31
const WEEK_31_LESSON_1 = toWords('week-31', [
  { id: 'cherry', text: 'Cherry', meaning: 'Quả anh đào' },
  { id: 'melon', text: 'Melon', meaning: 'Quả dưa lưới' },
  { id: 'plum', text: 'Plum', meaning: 'Quả mận' },
  { id: 'peach', text: 'Peach', meaning: 'Quả đào' },
  { id: 'grapefruit', text: 'Grapefruit', meaning: 'Quả bưởi' },
]);
const WEEK_31_LESSON_2 = toWords('week-31', [
  { id: 'star-apple', text: 'Star apple', meaning: 'Quả vú sữa' },
  { id: 'avocado', text: 'Avocado', meaning: 'Quả bơ' },
  { id: 'passion-fruit', text: 'Passion fruit', meaning: 'Quả chanh dây' },
  { id: 'strawberry', text: 'Strawberry', meaning: 'Quả dâu tây' },
  { id: 'blueberry', text: 'Blueberry', meaning: 'Quả việt quất' },
]);
const WEEK_31_WORDS = [...WEEK_31_LESSON_1, ...WEEK_31_LESSON_2];

// WEEK 33
const WEEK_33_LESSON_1 = toWords('week-33', [
  { id: 'rambutan', text: 'Rambutan', meaning: 'Quả chôm chôm' },
  { id: 'guava', text: 'Guava', meaning: 'Quả ổi' },
  { id: 'longan', text: 'Longan', meaning: 'Quả nhãn' },
  { id: 'lychee', text: 'Lychee', meaning: 'Quả vải' },
  { id: 'dragon-fruit', text: 'Dragon fruit', meaning: 'Quả thanh long' },
]);
const WEEK_33_LESSON_2 = toWords('week-33', [
  { id: 'durian', text: 'Durian', meaning: 'Quả sầu riêng' },
  { id: 'star-fruit', text: 'Star fruit', meaning: 'Quả khế' },
  { id: 'jackfruit', text: 'Jackfruit', meaning: 'Quả mít' },
  { id: 'mandarin', text: 'Mandarin', meaning: 'Quả quýt' },
  { id: 'mangosteen', text: 'Mangosteen', meaning: 'Quả măng cụt' },
]);
const WEEK_33_WORDS = [...WEEK_33_LESSON_1, ...WEEK_33_LESSON_2];

// WEEK 35
const WEEK_35_LESSON_1 = toWords('week-35', [
  { id: 'milk', text: 'Milk', meaning: 'Sữa' },
  { id: 'water', text: 'Water', meaning: 'Nước lọc' },
  { id: 'cola', text: 'Cola', meaning: 'Nước ngọt cola' },
  { id: 'tea', text: 'Tea', meaning: 'Trà' },
  { id: 'coffee', text: 'Coffee', meaning: 'Cà phê' },
]);
const WEEK_35_LESSON_2 = toWords('week-35', [
  { id: 'juice', text: 'Juice', meaning: 'Nước ép' },
  { id: 'milkshake', text: 'Milkshake', meaning: 'Sữa lắc' },
  { id: 'lemonade', text: 'Lemonade', meaning: 'Nước chanh' },
  { id: 'iced-tea', text: 'Iced tea', meaning: 'Trà đá' },
  { id: 'hot-chocolate', text: 'Hot chocolate', meaning: 'Sô-cô-la nóng' },
]);
const WEEK_35_WORDS = [...WEEK_35_LESSON_1, ...WEEK_35_LESSON_2];

// WEEK 37
const WEEK_37_LESSON_1 = toWords('week-37', [
  { id: 'rice', text: 'Rice', meaning: 'Cơm' },
  { id: 'noodles', text: 'Noodles', meaning: 'Mì' },
  { id: 'bread', text: 'Bread', meaning: 'Bánh mì' },
  { id: 'soup', text: 'Soup', meaning: 'Súp / Canh' },
]);
const WEEK_37_LESSON_2 = toWords('week-37', [
  { id: 'chicken', text: 'Chicken', meaning: 'Thịt gà' },
  { id: 'fish', text: 'Fish', meaning: 'Cá' },
  { id: 'egg', text: 'Egg', meaning: 'Trứng' },
  { id: 'meat', text: 'Meat', meaning: 'Thịt' },
]);
const WEEK_37_WORDS = [...WEEK_37_LESSON_1, ...WEEK_37_LESSON_2];

// WEEK 39
const WEEK_39_LESSON_1 = toWords('week-39', [
  { id: 'fever', text: 'Fever', meaning: 'Sốt' },
  { id: 'cough', text: 'Cough', meaning: 'Ho' },
  { id: 'cold', text: 'Cold', meaning: 'Cảm lạnh' },
  { id: 'headache', text: 'Headache', meaning: 'Đau đầu' },
]);
const WEEK_39_LESSON_2 = toWords('week-39', [
  { id: 'stomachache', text: 'Stomachache', meaning: 'Đau bụng' },
  { id: 'sore-throat', text: 'Sore throat', meaning: 'Đau họng' },
  { id: 'flu', text: 'Flu', meaning: 'Cúm' },
  { id: 'toothache', text: 'Toothache', meaning: 'Đau răng' },
]);
const WEEK_39_WORDS = [...WEEK_39_LESSON_1, ...WEEK_39_LESSON_2];

// WEEK 41
const WEEK_41_LESSON_1 = toWords('week-41', [
  { id: 'phone', text: 'Phone', meaning: 'Điện thoại' },
  { id: 'laptop', text: 'Laptop', meaning: 'Máy tính xách tay' },
  { id: 'tablet', text: 'Tablet', meaning: 'Máy tính bảng' },
  { id: 'computer', text: 'Computer', meaning: 'Máy vi tính' },
]);
const WEEK_41_LESSON_2 = toWords('week-41', [
  { id: 'tv', text: 'TV', meaning: 'Ti-vi' },
  { id: 'smartwatch', text: 'Smartwatch', meaning: 'Đồng hồ thông minh' },
  { id: 'headphones', text: 'Headphones', meaning: 'Tai nghe' },
  { id: 'camera', text: 'Camera', meaning: 'Máy ảnh' },
]);
const WEEK_41_WORDS = [...WEEK_41_LESSON_1, ...WEEK_41_LESSON_2];

// WEEK 43
const WEEK_43_LESSON_1 = toWords('week-43', [
  { id: 'earthquake', text: 'Earthquake', meaning: 'Động đất' },
  { id: 'flood', text: 'Flood', meaning: 'Lũ lụt' },
  { id: 'storm', text: 'Storm', meaning: 'Bão' },
  { id: 'typhoon', text: 'Typhoon', meaning: 'Bão nhiệt đới' },
  { id: 'tornado', text: 'Tornado', meaning: 'Lốc xoáy' },
]);
const WEEK_43_LESSON_2 = toWords('week-43', [
  { id: 'tsunami', text: 'Tsunami', meaning: 'Sóng thần' },
  { id: 'drought', text: 'Drought', meaning: 'Hạn hán' },
  { id: 'wildfire', text: 'Wildfire', meaning: 'Cháy rừng' },
  { id: 'landslide', text: 'Landslide', meaning: 'Sạt lở đất' },
]);
const WEEK_43_WORDS = [...WEEK_43_LESSON_1, ...WEEK_43_LESSON_2];

// WEEK 45
const WEEK_45_LESSON_1 = toWords('week-45', [
  { id: 'clap', text: 'Clap', meaning: 'Vỗ tay' },
  { id: 'wave', text: 'Wave', meaning: 'Vẫy tay' },
  { id: 'point', text: 'Point', meaning: 'Chỉ tay' },
  { id: 'touch', text: 'Touch', meaning: 'Chạm vào' },
]);
const WEEK_45_LESSON_2 = toWords('week-45', [
  { id: 'eat', text: 'Eat', meaning: 'Ăn' },
  { id: 'drink', text: 'Drink', meaning: 'Uống' },
  { id: 'sleep', text: 'Sleep', meaning: 'Ngủ' },
  { id: 'wash', text: 'Wash', meaning: 'Rửa tay / Tắm rửa' },
]);
const WEEK_45_WORDS = [...WEEK_45_LESSON_1, ...WEEK_45_LESSON_2];

// WEEK 47
const WEEK_47_LESSON_1 = toWords('week-47', [
  { id: 'brain', text: 'Brain', meaning: 'Bộ não' },
  { id: 'heart', text: 'Heart', meaning: 'Trái tim' },
  { id: 'lungs', text: 'Lungs', meaning: 'Phổi' },
  { id: 'stomach', text: 'Stomach', meaning: 'Dạ dày' },
]);
const WEEK_47_LESSON_2 = toWords('week-47', [
  { id: 'liver', text: 'Liver', meaning: 'Lá gan' },
  { id: 'kidneys', text: 'Kidneys', meaning: 'Quả thận' },
  { id: 'bones', text: 'Bones', meaning: 'Xương' },
  { id: 'intestine', text: 'Intestine', meaning: 'Đường ruột' },
]);
const WEEK_47_WORDS = [...WEEK_47_LESSON_1, ...WEEK_47_LESSON_2];

// WEEK 49
const WEEK_49_LESSON_1 = toWords('week-49', [
  { id: 'puppet', text: 'Puppet', meaning: 'Con rối' },
  { id: 'clown', text: 'Clown', meaning: 'Chú hề' },
  { id: 'balloon', text: 'Balloon', meaning: 'Bóng bay' },
  { id: 'pinwheel', text: 'Pinwheel', meaning: 'Chong chóng' },
  { id: 'yo-yo', text: 'Yo-yo', meaning: 'Con quay yo-yo' },
  { id: 'drum', text: 'Drum', meaning: 'Cái trống' },
  { id: 'dice', text: 'Dice', meaning: 'Xúc xắc' },
  { id: 'duck', text: 'Duck', meaning: 'Vịt đồ chơi' },
]);
const WEEK_49_LESSON_2 = toWords('week-49', [
  { id: 'music-box', text: 'Music box', meaning: 'Hộp âm nhạc' },
  { id: 'ufo', text: 'UFO', meaning: 'Đĩa bay UFO' },
  { id: 'marbles', text: 'Marbles', meaning: 'Viên bi' },
  { id: 'rocking-horse', text: 'Rocking horse', meaning: 'Ngựa gỗ bập bênh' },
  { id: 'scooter', text: 'Scooter', meaning: 'Xe trượt scooter' },
  { id: 'tricycle', text: 'Tricycle', meaning: 'Xe ba bánh' },
  { id: 'skipping-rope', text: 'Skipping rope', meaning: 'Dây nhảy' },
  { id: 'dinosaur', text: 'Dinosaur', meaning: 'Khủng long đồ chơi' },
]);
const WEEK_49_WORDS = [...WEEK_49_LESSON_1, ...WEEK_49_LESSON_2];

const SUPER_KIDS_UNITS: Partial<GameUnit>[] = [
  {
    slug: 'super-kids-week-1',
    name: 'COUNTRIES AROUND THE WORLD',
    unit: 'Week 1',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-sky-50 via-yellow-50 to-orange-50',
    flashcards: { title: 'Countries', autoAudio: true, words: WEEK_1_WORDS },
    wordOrdering: { title: 'Countries Word Ordering', words: WEEK_1_WORDS, showScore: true },
    wordScramble: { title: 'Countries Word Scramble', words: WEEK_1_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Countries Around the World', words: WEEK_1_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Countries Around the World', words: WEEK_1_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-3',
    name: 'THE SOLAR SYSTEM',
    unit: 'Week 3',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-indigo-50 via-purple-50 to-blue-50',
    flashcards: { title: 'The Solar System', autoAudio: true, words: WEEK_3_WORDS },
    wordOrdering: { title: 'The Solar System Word Ordering', words: WEEK_3_WORDS, showScore: true },
    wordScramble: { title: 'The Solar System Word Scramble', words: WEEK_3_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · The Solar System', words: WEEK_3_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · The Solar System', words: WEEK_3_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-5',
    name: 'THINGS IN MY HOUSE',
    unit: 'Week 5',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-amber-50 via-orange-50 to-yellow-50',
    flashcards: { title: 'Things in My House', autoAudio: true, words: WEEK_5_WORDS },
    wordOrdering: { title: 'Things in My House Word Ordering', words: WEEK_5_WORDS, showScore: true },
    wordScramble: { title: 'Things in My House Word Scramble', words: WEEK_5_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Living Room', words: WEEK_5_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Bedroom', words: WEEK_5_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-7',
    name: 'THINGS IN THE BATHROOM',
    unit: 'Week 7',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-cyan-50 via-sky-50 to-blue-50',
    flashcards: { title: 'Things in the Bathroom', autoAudio: true, words: WEEK_7_WORDS },
    wordOrdering: { title: 'Things in the Bathroom Word Ordering', words: WEEK_7_WORDS, showScore: true },
    wordScramble: { title: 'Things in the Bathroom Word Scramble', words: WEEK_7_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Bathroom Essentials', words: WEEK_7_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Bathroom Fixtures', words: WEEK_7_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-9',
    name: 'EMOTIONS',
    unit: 'Week 9',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-pink-50 via-rose-50 to-amber-50',
    flashcards: { title: 'Emotions', autoAudio: true, words: WEEK_9_WORDS },
    wordOrdering: { title: 'Emotions Word Ordering', words: WEEK_9_WORDS, showScore: true },
    wordScramble: { title: 'Emotions Word Scramble', words: WEEK_9_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Common Feelings', words: WEEK_9_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Expressive Feelings', words: WEEK_9_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-11',
    name: 'LAND SPORTS',
    unit: 'Week 11',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-emerald-50 via-teal-50 to-cyan-50',
    flashcards: { title: 'Land Sports', autoAudio: true, words: WEEK_11_WORDS },
    wordOrdering: { title: 'Land Sports Word Ordering', words: WEEK_11_WORDS, showScore: true },
    wordScramble: { title: 'Land Sports Word Scramble', words: WEEK_11_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Ball Sports', words: WEEK_11_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Action Sports', words: WEEK_11_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-13',
    name: 'AQUATIC SPORTS',
    unit: 'Week 13',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-blue-50 via-cyan-50 to-teal-50',
    flashcards: { title: 'Aquatic Sports', autoAudio: true, words: WEEK_13_WORDS },
    wordOrdering: { title: 'Aquatic Sports Word Ordering', words: WEEK_13_WORDS, showScore: true },
    wordScramble: { title: 'Aquatic Sports Word Scramble', words: WEEK_13_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Aquatic Sports', words: WEEK_13_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Aquatic Sports', words: WEEK_13_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-15',
    name: 'OPPOSITES',
    unit: 'Week 15',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-violet-50 via-purple-50 to-pink-50',
    flashcards: { title: 'Opposites', autoAudio: true, words: WEEK_15_WORDS },
    wordOrdering: { title: 'Opposites Word Ordering', words: WEEK_15_WORDS, showScore: true },
    wordScramble: { title: 'Opposites Word Scramble', words: WEEK_15_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Opposites', words: WEEK_15_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Opposites', words: WEEK_15_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-17',
    name: 'CHRISTMAS',
    unit: 'Week 17',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-red-50 via-rose-50 to-emerald-50',
    flashcards: { title: 'Christmas', autoAudio: true, words: WEEK_17_WORDS },
    wordOrdering: { title: 'Christmas Word Ordering', words: WEEK_17_WORDS, showScore: true },
    wordScramble: { title: 'Christmas Word Scramble', words: WEEK_17_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Christmas Traditions', words: WEEK_17_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Christmas Joy', words: WEEK_17_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-19',
    name: 'JOBS AND PLACES',
    unit: 'Week 19',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-blue-50 via-indigo-50 to-sky-50',
    flashcards: { title: 'Jobs and Places', autoAudio: true, words: WEEK_19_WORDS },
    wordOrdering: { title: 'Jobs and Places Word Ordering', words: WEEK_19_WORDS, showScore: true },
    wordScramble: { title: 'Jobs and Places Word Scramble', words: WEEK_19_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Community Helpers', words: WEEK_19_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Places of Work', words: WEEK_19_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-21',
    name: 'ACTION VERBS',
    unit: 'Week 21',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-amber-50 via-orange-50 to-lime-50',
    flashcards: { title: 'Action Verbs', autoAudio: true, words: WEEK_21_WORDS },
    wordOrdering: { title: 'Action Verbs Word Ordering', words: WEEK_21_WORDS, showScore: true },
    wordScramble: { title: 'Action Verbs Word Scramble', words: WEEK_21_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Everyday Actions', words: WEEK_21_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Expressive Actions', words: WEEK_21_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-23',
    name: 'POSITIONS',
    unit: 'Week 23',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-teal-50 via-emerald-50 to-cyan-50',
    flashcards: { title: 'Positions', autoAudio: true, words: WEEK_23_WORDS },
    wordOrdering: { title: 'Positions Word Ordering', words: WEEK_23_WORDS, showScore: true },
    wordScramble: { title: 'Positions Word Scramble', words: WEEK_23_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Basic Positions', words: WEEK_23_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Relative Positions', words: WEEK_23_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-25',
    name: 'ZODIAC ANIMALS',
    unit: 'Week 25',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-yellow-50 via-amber-50 to-orange-50',
    flashcards: { title: 'Zodiac Animals', autoAudio: true, words: WEEK_25_WORDS },
    wordOrdering: { title: 'Zodiac Animals Word Ordering', words: WEEK_25_WORDS, showScore: true },
    wordScramble: { title: 'Zodiac Animals Word Scramble', words: WEEK_25_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Zodiac Part 1', words: WEEK_25_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Zodiac Part 2', words: WEEK_25_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-27',
    name: 'VEGETABLES',
    unit: 'Week 27',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-emerald-50 via-green-50 to-lime-50',
    flashcards: { title: 'Vegetables', autoAudio: true, words: WEEK_27_WORDS },
    wordOrdering: { title: 'Vegetables Word Ordering', words: WEEK_27_WORDS, showScore: true },
    wordScramble: { title: 'Vegetables Word Scramble', words: WEEK_27_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Root Vegetables', words: WEEK_27_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Garden Vegetables', words: WEEK_27_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-29',
    name: 'MORE VEGETABLES',
    unit: 'Week 29',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-green-50 via-teal-50 to-emerald-50',
    flashcards: { title: 'More Vegetables', autoAudio: true, words: WEEK_29_WORDS },
    wordOrdering: { title: 'More Vegetables Word Ordering', words: WEEK_29_WORDS, showScore: true },
    wordScramble: { title: 'More Vegetables Word Scramble', words: WEEK_29_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Farm Vegetables', words: WEEK_29_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Salad Vegetables', words: WEEK_29_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-31',
    name: 'FRUITS',
    unit: 'Week 31',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-rose-50 via-red-50 to-pink-50',
    flashcards: { title: 'Fruits', autoAudio: true, words: WEEK_31_WORDS },
    wordOrdering: { title: 'Fruits Word Ordering', words: WEEK_31_WORDS, showScore: true },
    wordScramble: { title: 'Fruits Word Scramble', words: WEEK_31_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Sweet Fruits', words: WEEK_31_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Berries & More', words: WEEK_31_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-33',
    name: 'VIETNAMESE FRUITS',
    unit: 'Week 33',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-amber-50 via-yellow-50 to-orange-50',
    flashcards: { title: 'Vietnamese Fruits', autoAudio: true, words: WEEK_33_WORDS },
    wordOrdering: { title: 'Vietnamese Fruits Word Ordering', words: WEEK_33_WORDS, showScore: true },
    wordScramble: { title: 'Vietnamese Fruits Word Scramble', words: WEEK_33_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Tropical Delights', words: WEEK_33_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Exotic Fruits', words: WEEK_33_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-35',
    name: 'DRINKS',
    unit: 'Week 35',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-sky-50 via-blue-50 to-indigo-50',
    flashcards: { title: 'Drinks', autoAudio: true, words: WEEK_35_WORDS },
    wordOrdering: { title: 'Drinks Word Ordering', words: WEEK_35_WORDS, showScore: true },
    wordScramble: { title: 'Drinks Word Scramble', words: WEEK_35_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Daily Beverages', words: WEEK_35_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Refreshing Drinks', words: WEEK_35_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-37',
    name: 'MEALS',
    unit: 'Week 37',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-orange-50 via-amber-50 to-yellow-50',
    flashcards: { title: 'Meals', autoAudio: true, words: WEEK_37_WORDS },
    wordOrdering: { title: 'Meals Word Ordering', words: WEEK_37_WORDS, showScore: true },
    wordScramble: { title: 'Meals Word Scramble', words: WEEK_37_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Staple Foods', words: WEEK_37_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Proteins & Meat', words: WEEK_37_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-39',
    name: 'ILLNESS',
    unit: 'Week 39',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-rose-50 via-pink-50 to-purple-50',
    flashcards: { title: 'Illness', autoAudio: true, words: WEEK_39_WORDS },
    wordOrdering: { title: 'Illness Word Ordering', words: WEEK_39_WORDS, showScore: true },
    wordScramble: { title: 'Illness Word Scramble', words: WEEK_39_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Common Symptoms', words: WEEK_39_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Health Issues', words: WEEK_39_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-41',
    name: 'TECHNOLOGY',
    unit: 'Week 41',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-cyan-50 via-sky-50 to-blue-50',
    flashcards: { title: 'Technology', autoAudio: true, words: WEEK_41_WORDS },
    wordOrdering: { title: 'Technology Word Ordering', words: WEEK_41_WORDS, showScore: true },
    wordScramble: { title: 'Technology Word Scramble', words: WEEK_41_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Digital Devices', words: WEEK_41_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Smart Gadgets', words: WEEK_41_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-43',
    name: 'DISASTERS',
    unit: 'Week 43',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-amber-50 via-stone-50 to-slate-50',
    flashcards: { title: 'Disasters', autoAudio: true, words: WEEK_43_WORDS },
    wordOrdering: { title: 'Disasters Word Ordering', words: WEEK_43_WORDS, showScore: true },
    wordScramble: { title: 'Disasters Word Scramble', words: WEEK_43_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Natural Storms', words: WEEK_43_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Severe Hazards', words: WEEK_43_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-45',
    name: 'NEW ACTIONS',
    unit: 'Week 45',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-lime-50 via-emerald-50 to-teal-50',
    flashcards: { title: 'New Actions', autoAudio: true, words: WEEK_45_WORDS },
    wordOrdering: { title: 'New Actions Word Ordering', words: WEEK_45_WORDS, showScore: true },
    wordScramble: { title: 'New Actions Word Scramble', words: WEEK_45_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Hand Gestures', words: WEEK_45_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Daily Routines', words: WEEK_45_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-47',
    name: 'INSIDE US',
    unit: 'Week 47',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-pink-50 via-rose-50 to-red-50',
    flashcards: { title: 'Inside Us', autoAudio: true, words: WEEK_47_WORDS },
    wordOrdering: { title: 'Inside Us Word Ordering', words: WEEK_47_WORDS, showScore: true },
    wordScramble: { title: 'Inside Us Word Scramble', words: WEEK_47_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Vital Organs', words: WEEK_47_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Internal Anatomy', words: WEEK_47_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
  {
    slug: 'super-kids-week-49',
    name: 'TOYS',
    unit: 'Week 49',
    bookname: 'WeWIN Super Kids',
    bookType: 'super-kids',
    backgroundColor: 'from-yellow-50 via-amber-50 to-orange-50',
    flashcards: { title: 'Toys', autoAudio: true, words: WEEK_49_WORDS },
    wordOrdering: { title: 'Toys Word Ordering', words: WEEK_49_WORDS, showScore: true },
    wordScramble: { title: 'Toys Word Scramble', words: WEEK_49_WORDS, showScore: true },
    parts: [
      { id: 'lesson-1', title: 'Lesson 1 · Fun Playthings', words: WEEK_49_LESSON_1 },
      { id: 'lesson-2', title: 'Lesson 2 · Action Toys', words: WEEK_49_LESSON_2 },
    ],
    enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
  },
];

function isLocalHost(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return true;
  }
}

async function seedSuperKids() {
  const url = process.env.DATABASE_URL || 'postgresql://postgres:123123@localhost:5432/wewin_db';
  const dataSource = new DataSource({
    type: 'postgres',
    url,
    entities: ['src/entities/**/*.ts'],
    synchronize: false,
    logging: false,
    ssl: isLocalHost(url) ? false : { rejectUnauthorized: false },
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(GameUnit);

  // 1. Delete review units that should no longer be on web
  const validSlugs = new Set(SUPER_KIDS_UNITS.map((u) => u.slug));
  const existingAll = await repo.find({ where: { bookType: 'super-kids' } });
  for (const existing of existingAll) {
    if (!validSlugs.has(existing.slug)) {
      await repo.remove(existing);
      console.log(`Deleted Review Unit: ${existing.slug} (${existing.name})`);
    }
  }

  // 2. Upsert main units
  for (const unit of SUPER_KIDS_UNITS) {
    const existing = await repo.findOne({ where: { slug: unit.slug } });
    if (existing) {
      await repo.save({ ...existing, ...unit });
      console.log(`Updated ${unit.slug}`);
    } else {
      await repo.save(repo.create(unit));
      console.log(`Created ${unit.slug}`);
    }
  }

  await dataSource.destroy();
}

seedSuperKids().catch((err) => {
  console.error('Seeding Super Kids failed:', err);
  process.exit(1);
});
