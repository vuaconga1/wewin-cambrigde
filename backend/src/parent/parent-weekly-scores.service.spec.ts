import { ParentWeeklyScoresService } from './parent-weekly-scores.service';
import { parseIsoWeekKey } from './iso-week';

describe('ParentWeeklyScoresService', () => {
  const week = parseIsoWeekKey('2026-W17')!;
  const studentRepo = { findOne: jest.fn() };
  const monthlyScoreRepo = { createQueryBuilder: jest.fn() };
  const service = new ParentWeeklyScoresService(
    studentRepo as never,
    monthlyScoreRepo as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns unmatched without creating a student', async () => {
    studentRepo.findOne.mockResolvedValue(null);
    const result = await service.load('HV-1602', week);
    expect(monthlyScoreRepo.createQueryBuilder).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: true,
      studentId: 'HV-1602',
      matched: false,
      totalPoints: 0,
      rank: null,
      classSize: 0,
      rankScope: 'global',
      games: [],
    });
  });

  it('returns empty games when the student has no points that week', async () => {
    studentRepo.findOne.mockResolvedValue({ id: 'u1', playerId: 'HV-1602' });
    monthlyScoreRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { studentId: 'u2', gameType: 'flip', bestScore: 200 },
      ]),
    });

    const result = await service.load('HV-1602', week);
    expect(result.matched).toBe(true);
    expect(result.totalPoints).toBe(0);
    expect(result.rank).toBeNull();
    expect(result.classSize).toBe(1);
    expect(result.games).toEqual([]);
  });

  it('returns only this student games and a global rank', async () => {
    studentRepo.findOne.mockResolvedValue({ id: 'u1', playerId: 'HV-1602' });
    monthlyScoreRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { studentId: 'u2', gameType: 'flip', bestScore: 2000 },
        { studentId: 'u3', gameType: 'speak', bestScore: 1800 },
        { studentId: 'u4', gameType: 'memory', bestScore: 1500 },
        { studentId: 'u1', gameType: 'flip', bestScore: 960 },
        { studentId: 'u1', gameType: 'speak', bestScore: 280 },
      ]),
    });

    const result = await service.load('HV-1602', week);
    expect(result).toMatchObject({
      ok: true,
      matched: true,
      totalPoints: 1240,
      rank: 4,
      classSize: 4,
      rankScope: 'global',
    });
    expect(result.games).toEqual([
      { key: 'flip', name: 'Lật thẻ', points: 960 },
      { key: 'speak', name: 'Phát âm', points: 280 },
    ]);
  });
});
