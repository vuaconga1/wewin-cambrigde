import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { Student } from 'src/entities/student/student.entity';
import { GameScore } from 'src/entities/game-score/game-score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, GameScore])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}

