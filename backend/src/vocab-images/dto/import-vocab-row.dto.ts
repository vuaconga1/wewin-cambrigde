import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ImportVocabRowDto {
  @IsString()
  @MaxLength(255)
  word!: string;

  @IsOptional()
  @IsString()
  meaning?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  partOfSpeech?: string;
}