import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveGameProgressDto {
  @IsString()
  @MaxLength(50)
  playerId: string;

  @IsString()
  @MaxLength(80)
  unitSlug: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  partId?: string;

  @IsString()
  @MaxLength(120)
  bookname: string;

  @IsObject()
  progress: Record<string, boolean>;

  // scores removed: leaderboard handles best scores separately
}