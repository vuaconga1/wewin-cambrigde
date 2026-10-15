import { IsString, MaxLength } from 'class-validator';

export class WordActionDto {
  @IsString()
  @MaxLength(255)
  word!: string;
}