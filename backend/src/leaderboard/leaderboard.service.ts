import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/entities/student/student.entity';
import { GameScore } from 'src/entities/game-score/game-score.entity';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { GetTopDto } from './dto/get-top.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(GameScore)
    private readonly scoreRepo: Repository<GameScore>,
  ) {}

  private makeGameKey(unitSlug: string, partId: string, gameType: string) {
    return `${unitSlug}:${partId}:${gameType}`;
  }

  async submitBestScore(dto: SubmitScoreDto) {
    const playerId = dto.playerId.trim();
    const student = await this.studentRepo.findOne({
      where: { playerId, isActive: true },
    });
    if (!student) {
      throw new NotFoundException('ID người chơi không hợp lệ');
    }

    const unitSlug = dto.unitSlug.trim();
    const partId = dto.partId.trim() || 'default';
    const gameType = dto.gameType.trim();
    const gameKey = this.makeGameKey(unitSlug, partId, gameType);

    const existing = await this.scoreRepo.findOne({
      where: { gameKey, studentId: student.id },
    });

    if (!existing) {
      const created = this.scoreRepo.create({
        gameKey,
        unitSlug,
        partId,
        gameType,
        bestScore: dto.score,
        studentId: student.id,
        student,
      });
      const saved = await this.scoreRepo.save(created);
      return { bestScore: saved.bestScore };
    }

    if (dto.score > (existing.bestScore ?? 0)) {
      existing.bestScore = dto.score;
      await this.scoreRepo.save(existing);
    }

    return { bestScore: existing.bestScore };
  }

  async getTop(dto: GetTopDto) {
    const unitSlug = dto.unitSlug.trim();
    const partId = dto.partId?.trim() || 'default';
    const gameType = dto.gameType.trim();
    const gameKey = this.makeGameKey(unitSlug, partId, gameType);
    const take = Math.min(Math.max(dto.limit ?? 10, 1), 50);

    const rows = await this.scoreRepo.find({
      where: { gameKey },
      relations: ['student'],
      order: { bestScore: 'DESC', updatedAt: 'ASC' },
      take,
    });

    return rows.map((r) => ({
      studentId: r.studentId,
      playerId: r.student?.playerId ?? '',
      name: r.student?.name ?? '',
      bestScore: r.bestScore ?? 0,
    }));
  }
}

