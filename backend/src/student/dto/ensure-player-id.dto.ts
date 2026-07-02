import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class EnsurePlayerIdDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  playerId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
