import { computeHomeworkProgress, toScore10 } from './homework-progress';

const t = (iso: string) => new Date(iso);

const assignment = {
  gameTypes: ['flip', 'memory'],
  createdAt: t('2026-11-01T00:00:00Z'),
  deadlineAt: t('2026-11-08T00:00:00Z'),
};

describe('toScore10', () => {
  it('quy đổi theo thang 10, 1 chữ số thập phân', () => {
    expect(toScore10(735, 800)).toBe(9.2);
    expect(toScore10(800, 800)).toBe(10);
  });

  it('không có maxScore thì không có điểm', () => {
    expect(toScore10(500, null)).toBeNull();
    expect(toScore10(500, 0)).toBeNull();
  });

  it('chặn điểm vượt maxScore', () => {
    expect(toScore10(900, 800)).toBe(10);
  });
});

describe('computeHomeworkProgress', () => {
  it('chưa chơi gì → pending', () => {
    const p = computeHomeworkProgress(assignment, []);
    expect(p.status).toBe('pending');
    expect(p.doneCount).toBe(0);
    expect(p.totalCount).toBe(2);
    expect(p.submittedAt).toBeNull();
  });

  it('bỏ lần chơi trước khi giao bài', () => {
    const p = computeHomeworkProgress(assignment, [
      { gameType: 'flip', score: 50, maxScore: 50, createdAt: t('2026-10-31T23:59:59Z') },
    ]);
    expect(p.status).toBe('pending');
  });

  it('xong một phần → in_progress, điểm tạm theo game đã xong', () => {
    const p = computeHomeworkProgress(assignment, [
      { gameType: 'flip', score: 40, maxScore: 50, createdAt: t('2026-11-02T00:00:00Z') },
    ]);
    expect(p.status).toBe('in_progress');
    expect(p.doneCount).toBe(1);
    expect(p.score10).toBe(8);
    expect(p.submittedAt).toBeNull();
    expect(p.isLate).toBe(false);
  });

  it('lấy lần tốt nhất làm điểm, giờ nộp = lúc game cuối xong lần đầu', () => {
    const p = computeHomeworkProgress(assignment, [
      { gameType: 'flip', score: 30, maxScore: 50, createdAt: t('2026-11-02T00:00:00Z') },
      { gameType: 'memory', score: 400, maxScore: 800, createdAt: t('2026-11-03T00:00:00Z') },
      { gameType: 'flip', score: 50, maxScore: 50, createdAt: t('2026-11-09T00:00:00Z') },
    ]);
    expect(p.status).toBe('done');
    expect(p.games.flip).toMatchObject({ score10: 10, attemptCount: 2 });
    expect(p.score10).toBe(7.5);
    expect(p.attemptCount).toBe(3);
    expect(p.submittedAt).toEqual(t('2026-11-03T00:00:00Z'));
    // Chơi lại sau hạn để nâng điểm không làm bài bị tính trễ
    expect(p.isLate).toBe(false);
  });

  it('game cuối xong lần đầu sau hạn → trễ', () => {
    const p = computeHomeworkProgress(assignment, [
      { gameType: 'flip', score: 50, maxScore: 50, createdAt: t('2026-11-02T00:00:00Z') },
      { gameType: 'memory', score: 800, maxScore: 800, createdAt: t('2026-11-08T00:00:01Z') },
    ]);
    expect(p.status).toBe('done');
    expect(p.isLate).toBe(true);
  });

  it('attempt cũ không có maxScore vẫn tính là đã làm nhưng không có điểm', () => {
    const p = computeHomeworkProgress(
      { ...assignment, gameTypes: ['speak'] },
      [{ gameType: 'speak', score: 300, maxScore: null, createdAt: t('2026-11-02T00:00:00Z') }],
    );
    expect(p.status).toBe('done');
    expect(p.score10).toBeNull();
  });

  it('bỏ qua game không được giao', () => {
    const p = computeHomeworkProgress(assignment, [
      { gameType: 'speak', score: 300, maxScore: 300, createdAt: t('2026-11-02T00:00:00Z') },
    ]);
    expect(p.status).toBe('pending');
    expect(p.games.speak).toBeUndefined();
  });
});
