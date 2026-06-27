import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VocabImportService } from './vocab-import.service';

@Controller('vocab')
export class VocabImportController {
  constructor(private readonly vocabImportService: VocabImportService) {}

  @UseGuards(JwtAuthGuard)
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importVocabulary(@UploadedFile() file?: { buffer: Buffer; originalname: string }) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('CSV file is required (field name: file).');
    }

    const name = file.originalname.toLowerCase();
    if (!name.endsWith('.csv')) {
      throw new BadRequestException('Only CSV import is supported in skeleton. Excel support is TODO.');
    }

    return this.vocabImportService.importFromCsvBuffer(file.buffer);
  }
}