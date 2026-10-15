import dataSource from '../typeorm.config';
import { VocabImage } from '../src/entities/vocab-image/vocab-image.entity';
import { VocabImageStatus } from '../src/util/vocab-image.enum';
import { collectUniqueWordsFromBooks } from './vocabulary-seed.helpers';

async function seedVocabImages() {
  await dataSource.initialize();

  const repository = dataSource.getRepository(VocabImage);
  const uniqueWords = collectUniqueWordsFromBooks();

  let created = 0;
  let updated = 0;

  for (const entry of uniqueWords) {
    let record = await repository.findOne({ where: { slug: entry.slug } });

    if (!record) {
      record = repository.create({
        word: entry.word,
        slug: entry.slug,
        meaning: entry.meaning,
        imageStatus: VocabImageStatus.NONE,
        rejectedCount: 0,
      });
      await repository.save(record);
      created += 1;
      continue;
    }

    const nextWord = entry.word;
    const nextMeaning = entry.meaning ?? record.meaning ?? null;
    if (record.word !== nextWord || record.meaning !== nextMeaning) {
      record.word = nextWord;
      record.meaning = nextMeaning;
      await repository.save(record);
      updated += 1;
    }
  }

  console.log(`Unique words scanned: ${uniqueWords.length}`);
  console.log(`Created: ${created}, updated metadata: ${updated}`);

  await dataSource.destroy();
}

seedVocabImages().catch((err) => {
  console.error('Vocab image seeding failed:', err);
  process.exit(1);
});