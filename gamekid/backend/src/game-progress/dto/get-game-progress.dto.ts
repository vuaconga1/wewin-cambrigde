import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetGameProgressDto {
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
}