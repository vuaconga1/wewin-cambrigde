import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { Student } from 'src/entities/student/student.entity';
import { GameScore } from 'src/entities/game-score/game-score.entity';
import { MonthlyGameScore } from 'src/entities/game-score/monthly-game-score.entity';
import { GameUnit } from 'src/entities/game/game-unit.entity';
import { GameAttempt } from 'src/entities/game-attempt/game-attempt.entity';
import { StudentModule } from 'src/student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      GameScore,
      MonthlyGameScore,
      GameUnit,
      GameAttempt,
    ]),
    StudentModule,
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
