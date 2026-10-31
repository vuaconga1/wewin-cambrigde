import { IsOptional, IsString } from 'class-validator';

export class LoginDto {
  // Email hoặc username (Mã HV)
  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  password!: string;
}
