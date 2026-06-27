import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string | null; // FIX password nullable

  @IsOptional()
  @IsString()
  image?: string | null;

  @IsOptional()
  dob?: Date;

  @IsOptional()
  address?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // FIX lỗi "isActive does not exist"

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  roleIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  role?: number;
}
