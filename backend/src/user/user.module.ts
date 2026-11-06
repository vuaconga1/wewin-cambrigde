import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.entity';
import { Role } from 'src/entities/role/role.entity';
import { StaffGuard } from 'src/class/staff.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    // Cùng secret với AuthModule; không import AuthModule để tránh vòng phụ thuộc
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'default_secret',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, StaffGuard],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
