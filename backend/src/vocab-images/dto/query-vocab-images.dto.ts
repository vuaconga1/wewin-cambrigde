import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { VocabImageStatus } from '../../util/vocab-image.enum';

export class QueryVocabImagesDto {
  @IsOptional()
  @IsEnum(VocabImageStatus)
  status?: VocabImageStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}