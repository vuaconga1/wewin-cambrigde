import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  playerId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
