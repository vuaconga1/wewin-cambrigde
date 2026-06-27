import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyItem } from '../entities/vocabulary/vocabulary-item.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

@Module({
  imports: [TypeOrmModule.forFeature([VocabularyItem])],
  controllers: [VocabularyController],
  providers: [VocabularyService],
})
export class VocabularyModule {}