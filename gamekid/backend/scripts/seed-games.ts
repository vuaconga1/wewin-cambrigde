import { DataSource } from 'typeorm';
import { GameUnit } from '../src/entities/game/game-unit.entity';

// Import book configs từ frontend data
const FAST_FOOD_RESTAURANT_OWNER = {
  slug: 'fast-food-restaurant-owner',
  name: 'FAST FOOD RESTAURANT OWNER',
  unit: 'Unit 11',
  bookname: 'GIAI ĐOẠN 2: Mùa Đông - Kinh doanh & Sinh viên',
  backgroundColor: 'from-red-50 via-orange-50 to-yellow-50',
  bookType: 'kids',
  flashcards: {
    title: 'Fast Food',
    autoAudio: true,
    words: [
      { id: 'fries', text: 'fries', emoji: '🍟', meaning: 'Khoai tây chiên' },
      { id: 'sandwich', text: 'sandwich', emoji: '🥪', meaning: 'Bánh mì kẹp' },
      { id: 'hamburger', text: 'hamburger', emoji: '🍔', meaning: 'Bánh hăm-bơ-gơ' },
      { id: 'pizza', text: 'pizza', emoji: '🍕', meaning: 'Bánh pizza' },
      { id: 'hot-dog', text: 'hot dog', emoji: '🌭', meaning: 'Bánh mì xúc xích' },
      { id: 'spaghetti', text: 'spaghetti', emoji: '🍝', meaning: 'Mì Ý' },
      { id: 'ice-cream', text: 'ice cream', emoji: '🍦', meaning: 'Kem' },
      { id: 'donut', text: 'donut', emoji: '🍩', meaning: 'Bánh vòng' },
      { id: 'cake', text: 'cake', emoji: '🍰', meaning: 'Bánh ngọt' },
      { id: 'soda', text: 'soda', emoji: '🥤', meaning: 'Nước ngọt' },
    ],
  },
  wordOrdering: {
    title: 'Fast Food Word Ordering',
    words: [
      { id: 'fries', text: 'fries', emoji: '🍟', meaning: 'Khoai tây chiên' },
      { id: 'sandwich', text: 'sandwich', emoji: '🥪', meaning: 'Bánh mì kẹp' },
      { id: 'hamburger', text: 'hamburger', emoji: '🍔', meaning: 'Bánh hăm-bơ-gơ' },
      { id: 'pizza', text: 'pizza', emoji: '🍕', meaning: 'Bánh pizza' },
      { id: 'hot-dog', text: 'hot dog', emoji: '🌭', meaning: 'Bánh mì xúc xích' },
      { id: 'spaghetti', text: 'spaghetti', emoji: '🍝', meaning: 'Mì Ý' },
      { id: 'ice-cream', text: 'ice cream', emoji: '🍦', meaning: 'Kem' },
      { id: 'donut', text: 'donut', emoji: '🍩', meaning: 'Bánh vòng' },
      { id: 'cake', text: 'cake', emoji: '🍰', meaning: 'Bánh ngọt' },
      { id: 'soda', text: 'soda', emoji: '🥤', meaning: 'Nước ngọt' },
    ],
    showScore: true,
  },
  wordScramble: {
    title: 'Fast Food Word Scramble',
    words: [
      { id: 'fries', text: 'fries', emoji: '🍟', meaning: 'Khoai tây chiên' },
      { id: 'sandwich', text: 'sandwich', emoji: '🥪', meaning: 'Bánh mì kẹp' },
      { id: 'hamburger', text: 'hamburger', emoji: '🍔', meaning: 'Bánh hăm-bơ-gơ' },
      { id: 'pizza', text: 'pizza', emoji: '🍕', meaning: 'Bánh pizza' },
      { id: 'hot-dog', text: 'hot dog', emoji: '🌭', meaning: 'Bánh mì xúc xích' },
      { id: 'spaghetti', text: 'spaghetti', emoji: '🍝', meaning: 'Mì Ý' },
      { id: 'ice-cream', text: 'ice cream', emoji: '🍦', meaning: 'Kem' },
      { id: 'donut', text: 'donut', emoji: '🍩', meaning: 'Bánh vòng' },
      { id: 'cake', text: 'cake', emoji: '🍰', meaning: 'Bánh ngọt' },
      { id: 'soda', text: 'soda', emoji: '🥤', meaning: 'Nước ngọt' },
    ],
    showScore: true,
  },
  enabledGames: ['flip', 'speak', 'memory', 'ordering', 'scramble'],
};

async function seedGameData() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://postgres:123123@localhost:5432/wewin_db',
    entities: ['src/entities/**/*.ts'],
    migrations: ['src/migrations/**/*.ts'],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();

  const gameRepository = dataSource.getRepository(GameUnit);

  // Seed Fast Food game
  const existing = await gameRepository.findOne({ where: { slug: 'fast-food-restaurant-owner' } });
  if (existing) {
    console.log('⚠️ Fast Food game already exists, skipping...');
  } else {
    await gameRepository.save(FAST_FOOD_RESTAURANT_OWNER);
  }

  console.log('✅ Game data seeded successfully!');
  await dataSource.destroy();
}

seedGameData().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
