import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Student } from 'src/entities/student/student.entity';
import { GameScore } from 'src/entities/game-score/game-score.entity';
import { MonthlyGameScore } from 'src/entities/game-score/monthly-game-score.entity';
import { GameUnit } from 'src/entities/game/game-unit.entity';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { GetTopDto } from './dto/get-top.dto';
import { GetMonthlyTopDto } from './dto/get-monthly-top.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(GameScore)
    private readonly scoreRepo: Repository<GameScore>,
    @InjectRepository(MonthlyGameScore)
    private readonly monthlyScoreRepo: Repository<MonthlyGameScore>,
    @InjectRepository(GameUnit)
    private readonly gameUnitRepo: Repository<GameUnit>,
  ) {}

  private makeGameKey(unitSlug: string, partId: string, gameType: string) {
    return `${unitSlug}:${partId}:${gameType}`;
  }

  private getVietnamYearMonth(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: 'numeric',
    }).formatToParts(date);
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    return { year, month };
  }

  private async resolveBookType(unitSlug: string, fallback?: string) {
    if (fallback?.trim()) return fallback.trim();
    const unit = await this.gameUnitRepo.findOne({ where: { slug: unitSlug } });
    return unit?.bookType?.trim() || 'unknown';
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
    const bookType = await this.resolveBookType(unitSlug, dto.bookType);
    const { year, month } = this.getVietnamYearMonth();

    const existing = await this.scoreRepo.findOne({
      where: { gameKey, studentId: student.id },
    });

    let bestScore = dto.score;
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
      bestScore = saved.bestScore;
    } else if (dto.score > (existing.bestScore ?? 0)) {
      existing.bestScore = dto.score;
      await this.scoreRepo.save(existing);
      bestScore = existing.bestScore;
    } else {
      bestScore = existing.bestScore ?? 0;
    }

    const monthly = await this.monthlyScoreRepo.findOne({
      where: {
        studentId: student.id,
        gameKey,
        year,
        month,
      },
    });

    if (!monthly) {
      await this.monthlyScoreRepo.save(
        this.monthlyScoreRepo.create({
          bookType,
          year,
          month,
          gameKey,
          unitSlug,
          partId,
          gameType,
          bestScore: dto.score,
          studentId: student.id,
          student,
        }),
      );
    } else if (dto.score > (monthly.bestScore ?? 0)) {
      monthly.bestScore = dto.score;
      monthly.bookType = bookType;
      await this.monthlyScoreRepo.save(monthly);
    }

    return { bestScore };
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

  async getMonthlyTop(dto: GetMonthlyTopDto) {
    const bookType = dto.bookType.trim();
    const year = dto.year;
    const month = dto.month;
    const take = Math.min(Math.max(dto.limit ?? 50, 1), 100);

    const rawRows: Array<{
      student_id: string;
      total_score: string;
      latest_update: Date;
    }> = await this.monthlyScoreRepo
      .createQueryBuilder('m')
      .select('m.student_id', 'student_id')
      .addSelect('SUM(m.best_score)', 'total_score')
      .addSelect('MAX(m.updated_at)', 'latest_update')
      .where('m.book_type = :bookType', { bookType })
      .andWhere('m.year = :year', { year })
      .andWhere('m.month = :month', { month })
      .groupBy('m.student_id')
      .orderBy('total_score', 'DESC')
      .addOrderBy('latest_update', 'ASC')
      .getRawMany();

    const studentIds = rawRows.map((r) => r.student_id);
    const students =
      studentIds.length === 0
        ? []
        : await this.studentRepo.find({ where: { id: In(studentIds) } });
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const ranked = rawRows.map((r, index) => {
      const student = studentMap.get(r.student_id);
      return {
        rank: index + 1,
        studentId: r.student_id,
        playerId: student?.playerId ?? '',
        name: student?.name ?? '',
        totalScore: Number(r.total_score) || 0,
      };
    });

    const rows = ranked.slice(0, take);
    const updatedAt =
      rawRows.reduce<Date | null>((latest, row) => {
        const d = row.latest_update ? new Date(row.latest_update) : null;
        if (!d) return latest;
        if (!latest || d > latest) return d;
        return latest;
      }, null) ?? new Date();

    let me: (typeof ranked)[number] | null = null;
    const playerId = dto.playerId?.trim();
    if (playerId) {
      const student = await this.studentRepo.findOne({
        where: { playerId, isActive: true },
      });
      if (student) {
        me = ranked.find((r) => r.studentId === student.id) ?? {
          rank: 0,
          studentId: student.id,
          playerId: student.playerId,
          name: student.name,
          totalScore: 0,
        };
      }
    }

    return {
      bookType,
      year,
      month,
      updatedAt: updatedAt.toISOString(),
      rows,
      me,
    };
  }
}
