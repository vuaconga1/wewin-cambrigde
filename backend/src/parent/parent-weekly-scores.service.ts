import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyGameScore } from 'src/entities/game-score/monthly-game-score.entity';
import { Student } from 'src/entities/student/student.entity';
import {
  parseParentWeekQuery,
  type IsoWeekWindow,
} from './iso-week';

export const PARENT_WEEKLY_WEEK_MESSAGE =
  'Thiếu hoặc sai tuần (weekKey=YYYY-Www).';

const GAME_NAMES: Record<string, string> = {
  flip: 'Lật thẻ',
  speak: 'Phát âm',
  memory: 'Lật hình',
  ordering: 'Ghép câu',
  scramble: 'Sắp xếp từ',
  matching: 'Nối từ',
};

const GAME_ORDER = ['flip', 'speak', 'memory', 'ordering', 'scramble', 'matching'];

export type ParentWeeklyGameScore = {
  key: string;
  name: string;
  points: number;
};

export type ParentWeeklyScoresOk = {
  ok: true;
  studentId: string;
  matched: boolean;
  weekKey: string;
  isoWeek: number;
  weekYear: number;
  rangeLabel: string;
  totalPoints: number;
  rank: number | null;
  classSize: number;
  rankScope: 'global';
  games: ParentWeeklyGameScore[];
};

function emptyPayload(
  studentId: string,
  week: IsoWeekWindow,
  matched: boolean,
  classSize = 0,
): ParentWeeklyScoresOk {
  return {
    ok: true,
    studentId,
    matched,
    weekKey: week.weekKey,
    isoWeek: week.isoWeek,
    weekYear: week.weekYear,
    rangeLabel: week.rangeLabel,
    totalPoints: 0,
    rank: null,
    classSize,
    rankScope: 'global',
    games: [],
  };
}

function gameDisplayName(key: string): string {
  return GAME_NAMES[key] || key;
}

@Injectable()
export class ParentWeeklyScoresService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(MonthlyGameScore)
    private readonly monthlyScoreRepo: Repository<MonthlyGameScore>,
  ) {}

  parseWeek(query: {
    weekKey?: string;
    week?: string;
    year?: string;
  }): IsoWeekWindow | null {
    return parseParentWeekQuery(query);
  }

  async load(studentId: string, week: IsoWeekWindow): Promise<ParentWeeklyScoresOk> {
    const username = studentId.trim();
    const student = await this.studentRepo.findOne({
      where: { playerId: username, isActive: true },
      select: { id: true, playerId: true },
    });

    if (!student) {
      return emptyPayload(username, week, false, 0);
    }

    const rows: Array<{
      studentId: string;
      gameType: string;
      bestScore: string | number;
    }> = await this.monthlyScoreRepo
      .createQueryBuilder('m')
      .select('m.studentId', 'studentId')
      .addSelect('m.gameType', 'gameType')
      .addSelect('m.bestScore', 'bestScore')
      .where('m.updatedAt >= :start AND m.updatedAt < :end', {
        start: week.start,
        end: week.end,
      })
      .getRawMany();

    const totals = new Map<string, number>();
    const gamesByStudent = new Map<string, Map<string, number>>();

    for (const row of rows) {
      const points = Number(row.bestScore) || 0;
      totals.set(row.studentId, (totals.get(row.studentId) ?? 0) + points);
      if (!gamesByStudent.has(row.studentId)) {
        gamesByStudent.set(row.studentId, new Map());
      }
      const games = gamesByStudent.get(row.studentId)!;
      games.set(row.gameType, (games.get(row.gameType) ?? 0) + points);
    }

    const ranked = [...totals.entries()]
      .map(([id, points]) => ({ id, points }))
      .sort((a, b) => b.points - a.points || a.id.localeCompare(b.id));

    const classSize = ranked.length;
    const studentPoints = totals.get(student.id) ?? 0;
    const rank =
      studentPoints > 0
        ? ranked.findIndex((row) => row.id === student.id) + 1
        : null;

    if (studentPoints <= 0) {
      return emptyPayload(username, week, true, classSize);
    }

    const games = [...(gamesByStudent.get(student.id)?.entries() ?? [])]
      .map(([key, points]) => ({
        key,
        name: gameDisplayName(key),
        points,
      }))
      .filter((row) => row.points > 0)
      .sort((a, b) => {
        const ai = GAME_ORDER.indexOf(a.key);
        const bi = GAME_ORDER.indexOf(b.key);
        const ao = ai === -1 ? GAME_ORDER.length : ai;
        const bo = bi === -1 ? GAME_ORDER.length : bi;
        return ao - bo || a.key.localeCompare(b.key);
      });

    return {
      ok: true,
      studentId: username,
      matched: true,
      weekKey: week.weekKey,
      isoWeek: week.isoWeek,
      weekYear: week.weekYear,
      rangeLabel: week.rangeLabel,
      totalPoints: studentPoints,
      rank,
      classSize,
      rankScope: 'global',
      games,
    };
  }
}
