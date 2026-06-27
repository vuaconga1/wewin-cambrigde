import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class SubmitScoreDto {
  @IsString()
  @MaxLength(50)
  playerId: string;

  @IsString()
  @MaxLength(80)
  unitSlug: string;

  @IsString()
  @MaxLength(40)
  partId: string;

  @IsString()
  @MaxLength(40)
  gameType: string;

  @IsInt()
  @Min(0)
  score: number;
}

