import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class GetTopDto {
  @IsString()
  @MaxLength(80)
  unitSlug: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  partId?: string;

  @IsString()
  @MaxLength(40)
  gameType: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

