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
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  // Email không bắt buộc (học viên đăng nhập bằng Mã HV); chuỗi rỗng = xóa email
  @IsOptional()
  @ValidateIf((o: CreateUserDto) => !!o.email)
  @IsEmail()
  email?: string | null;

  // Mã HV / tên đăng nhập; chuỗi rỗng = xóa username
  @IsOptional()
  @ValidateIf((o: CreateUserDto) => !!o.username)
  @IsString()
  @MaxLength(50)
  @Matches(/^[\w.-]+$/, {
    message: 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch ngang, gạch dưới',
  })
  username?: string | null;

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
