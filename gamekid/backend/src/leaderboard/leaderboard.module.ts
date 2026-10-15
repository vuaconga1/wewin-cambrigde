import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { Student } from 'src/entities/student/student.entity';
import { GameScore } from 'src/entities/game-score/game-score.entity';
import { MonthlyGameScore } from 'src/entities/game-score/monthly-game-score.entity';
import { GameUnit } from 'src/entities/game/game-unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, GameScore, MonthlyGameScore, GameUnit]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
