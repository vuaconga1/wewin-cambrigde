import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyPlayerIdDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  playerId: string;
}
