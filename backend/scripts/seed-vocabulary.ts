import { GameUnit } from '../src/entities/game/game-unit.entity';
import { VocabularyItem } from '../src/entities/vocabulary/vocabulary-item.entity';
import dataSource from '../typeorm.config';
import { DEFAULT_ENABLED_GAMES } from '../../frontend/types/games';
import { BOOKS, buildVocabularyRows } from './vocabulary-seed.helpers';

async function seedVocabulary() {
  await dataSource.initialize();

  const gameRepository = dataSource.getRepository(GameUnit);
  const vocabularyRepository = dataSource.getRepository(VocabularyItem);

  const gameUnits: Partial<GameUnit>[] = [];
  const vocabularyRows: Partial<VocabularyItem>[] = [];

  for (const book of BOOKS) {
    for (const unit of book.units) {
      gameUnits.push({
        ...unit,
        bookType: book.bookType,
        enabledGames: unit.enabledGames ?? DEFAULT_ENABLED_GAMES,
      });

      vocabularyRows.push(...buildVocabularyRows(book.bookType, unit));
    }
  }

  await gameRepository.clear();
  await vocabularyRepository.clear();

  await gameRepository.save(gameUnits);
  await vocabularyRepository.save(vocabularyRows);

  console.log(`✅ Seeded ${gameUnits.length} game units`);
  console.log(`✅ Seeded ${vocabularyRows.length} vocabulary rows`);

  await dataSource.destroy();
}

seedVocabulary().catch((err) => {
  console.error('❌ Vocabulary seeding failed:', err);
  process.exit(1);
});
