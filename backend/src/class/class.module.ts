import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Classroom } from 'src/entities/class/classroom.entity';
import { ClassMember } from 'src/entities/class/class-member.entity';
import { ClassAssignment } from 'src/entities/class/class-assignment.entity';
import { ClassAuditLog } from 'src/entities/class/class-audit-log.entity';
import { GameAttempt } from 'src/entities/game-attempt/game-attempt.entity';
import { GameUnit } from 'src/entities/game/game-unit.entity';
import { User } from 'src/entities/user/user.entity';
import { ClassController } from './class.controller';
import { HomeworkController } from './homework.controller';
import { ClassService } from './class.service';
import { HomeworkService } from './homework.service';
import { StaffGuard } from './staff.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Classroom,
      ClassMember,
      ClassAssignment,
      ClassAuditLog,
      GameAttempt,
      GameUnit,
      User,
    ]),
    AuthModule,
  ],
  controllers: [ClassController, HomeworkController],
  providers: [ClassService, HomeworkService, StaffGuard],
})
export class ClassModule {}
