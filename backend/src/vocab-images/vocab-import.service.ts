import { BadRequestException, Injectable } from '@nestjs/common';
import { ImportVocabRowDto } from './dto/import-vocab-row.dto';
import { VocabImagesService } from './vocab-images.service';

@Injectable()
export class VocabImportService {
  constructor(private readonly vocabImagesService: VocabImagesService) {}

  async importFromCsvBuffer(buffer: Buffer) {
    const text = buffer.toString('utf8');
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length === 0) {
      throw new BadRequestException('CSV file is empty.');
    }

    const header = lines[0].split(',').map((cell) => cell.trim().toLowerCase());
    const wordIndex = header.indexOf('word');
    if (wordIndex === -1) {
      throw new BadRequestException('CSV must include a "word" column.');
    }

    const meaningIndex = header.indexOf('meaning');
    const partIndex = header.findIndex((h) =>
      ['partofspeech', 'part_of_speech', 'pos'].includes(h),
    );

    const rows: ImportVocabRowDto[] = [];

    for (const line of lines.slice(1)) {
      const cells = line.split(',').map((cell) => cell.trim());
      const word = cells[wordIndex];
      if (!word) continue;

      rows.push({
        word,
        meaning: meaningIndex >= 0 ? cells[meaningIndex] : undefined,
        partOfSpeech: partIndex >= 0 ? cells[partIndex] : undefined,
      });
    }

    return this.vocabImagesService.importRows(rows);
  }
}