import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyGameScore } from 'src/entities/game-score/monthly-game-score.entity';
import { Student } from 'src/entities/student/student.entity';
import { ParentWeeklyScoresController } from './parent-weekly-scores.controller';
import { ParentWeeklyScoresService } from './parent-weekly-scores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, MonthlyGameScore])],
  controllers: [ParentWeeklyScoresController],
  providers: [ParentWeeklyScoresService],
})
export class ParentModule {}
