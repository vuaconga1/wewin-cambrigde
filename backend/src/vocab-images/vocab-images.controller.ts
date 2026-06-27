import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GenerateMissingDto } from './dto/generate-missing.dto';
import { QueryVocabImagesDto } from './dto/query-vocab-images.dto';
import { WordActionDto } from './dto/word-action.dto';
import { VocabImagesService } from './vocab-images.service';

@Controller('vocab-images')
export class VocabImagesController {
  constructor(private readonly vocabImagesService: VocabImagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-missing')
  generateMissing(@Body() body: GenerateMissingDto) {
    return this.vocabImagesService.generateMissing(body.limit ?? 5);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  findPending() {
    return this.vocabImagesService.findPending();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMany(@Query() query: QueryVocabImagesDto) {
    return this.vocabImagesService.findMany(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('approve')
  approve(@Body() body: WordActionDto) {
    return this.vocabImagesService.approve(body.word);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reject')
  reject(@Body() body: WordActionDto) {
    return this.vocabImagesService.reject(body.word);
  }

  @UseGuards(JwtAuthGuard)
  @Post('regenerate')
  regenerate(@Body() body: WordActionDto) {
    return this.vocabImagesService.regenerate(body.word);
  }
}