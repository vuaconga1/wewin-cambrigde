import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { VocabImage } from '../entities/vocab-image/vocab-image.entity';
import { VocabImportController } from './vocab-import.controller';
import { VocabImportService } from './vocab-import.service';
import { VocabImagesController } from './vocab-images.controller';
import { VocabImagesGeneratorService } from './vocab-images-generator.service';
import { VocabImagesService } from './vocab-images.service';
import { VocabImagesStorageService } from './vocab-images-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([VocabImage]), AuthModule],
  controllers: [VocabImagesController, VocabImportController],
  providers: [
    VocabImagesService,
    VocabImagesStorageService,
    VocabImagesGeneratorService,
    VocabImportService,
  ],
  exports: [VocabImagesService],
})
export class VocabImagesModule {}