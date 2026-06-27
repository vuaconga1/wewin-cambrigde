import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/entities/student/student.entity';
import { GameProgress } from 'src/entities/game-progress/game-progress.entity';
import { GameProgressController } from './game-progress.controller';
import { GameProgressService } from './game-progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, GameProgress])],
  controllers: [GameProgressController],
  providers: [GameProgressService],
})
export class GameProgressModule {}