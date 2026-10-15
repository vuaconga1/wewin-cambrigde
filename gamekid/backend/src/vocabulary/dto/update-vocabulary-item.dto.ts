import { PartialType } from '@nestjs/mapped-types';
import { CreateVocabularyItemDto } from './create-vocabulary-item.dto';

export class UpdateVocabularyItemDto extends PartialType(
  CreateVocabularyItemDto,
) {}