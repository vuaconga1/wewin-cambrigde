import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVocabularyItemDto {
  @IsString()
  @MaxLength(50)
  bookType: string;

  @IsString()
  @MaxLength(100)
  gameSlug: string;

  @IsString()
  @MaxLength(50)
  unit: string;

  @IsString()
  @MaxLength(255)
  unitTitle: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sectionId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sectionTitle?: string | null;

  @IsString()
  @MaxLength(100)
  wordId: string;

  @IsString()
  @MaxLength(255)
  word: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emoji?: string | null;

  @IsOptional()
  @IsString()
  meaning?: string | null;

  @IsOptional()
  @IsString()
  link?: string | null;

  @IsOptional()
  @IsString()
  audioUrl?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}