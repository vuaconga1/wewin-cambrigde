import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyItemDto } from './dto/create-vocabulary-item.dto';
import { UpdateVocabularyItemDto } from './dto/update-vocabulary-item.dto';

@Controller('vocabulary-items')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  create(@Body() body: CreateVocabularyItemDto) {
    return this.vocabularyService.create(body);
  }

  @Get()
  findAll() {
    return this.vocabularyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vocabularyService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateVocabularyItemDto) {
    return this.vocabularyService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vocabularyService.remove(id);
  }
}