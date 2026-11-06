export type AttemptLike = {
  gameType: string;
  score: number;
  maxScore?: number | null;
  createdAt: Date;
};

export type AssignmentLike = {
  gameTypes: string[];
  createdAt: Date;
  deadlineAt: Date;
};

export type GameProgress =
  | { status: 'pending' }
  | {
      status: 'done';
      score10: number | null;
      attemptCount: number;
      firstDoneAt: Date;
    };

export type HomeworkProgress = {
  status: 'pending' | 'in_progress' | 'done';
  doneCount: number;
  totalCount: number;
  score10: number | null;
  attemptCount: number;
  submittedAt: Date | null;
  isLate: boolean;
  games: Record<string, GameProgress>;
};

export function toScore10(score: number, maxScore?: number | null) {
  if (!maxScore || maxScore <= 0) return null;
  const ratio = Math.min(Math.max(score / maxScore, 0), 1);
  return Math.round(ratio * 100) / 10;
}

function ratioOf(a: AttemptLike) {
  return a.maxScore && a.maxScore > 0 ? a.score / a.maxScore : -1;
}

/**
 * Tiến độ một bài tập của một học viên. `attempts` là các lần chơi của học viên
 * trong đúng bài học (unitSlug + partId); hàm tự bỏ lần chơi trước khi giao bài.
 */
export function computeHomeworkProgress(
  assignment: AssignmentLike,
  attempts: AttemptLike[],
): HomeworkProgress {
  const assignedAt = assignment.createdAt.getTime();
  const relevant = attempts.filter((a) => a.createdAt.getTime() >= assignedAt);

  const games: Record<string, GameProgress> = {};
  for (const gameType of assignment.gameTypes) {
    const list = relevant.filter((a) => a.gameType === gameType);
    if (list.length === 0) {
      games[gameType] = { status: 'pending' };
      continue;
    }
    const byTime = [...list].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    // Sắp xếp ổn định theo thời gian nên khi hòa điểm, lần sớm nhất thắng
    const best = byTime.reduce((top, a) => (ratioOf(a) > ratioOf(top) ? a : top));
    games[gameType] = {
      status: 'done',
      score10: toScore10(best.score, best.maxScore),
      attemptCount: list.length,
      firstDoneAt: byTime[0].createdAt,
    };
  }

  const done = Object.values(games).filter(
    (g): g is Extract<GameProgress, { status: 'done' }> => g.status === 'done',
  );
  const totalCount = assignment.gameTypes.length;
  const status =
    done.length === totalCount && totalCount > 0
      ? 'done'
      : done.length > 0
        ? 'in_progress'
        : 'pending';

  const scores = done
    .map((g) => g.score10)
    .filter((s): s is number => s !== null);
  const score10 =
    scores.length > 0
      ? Math.round((scores.reduce((s, x) => s + x, 0) / scores.length) * 10) /
        10
      : null;

  const submittedAt =
    status === 'done'
      ? new Date(Math.max(...done.map((g) => g.firstDoneAt.getTime())))
      : null;

  return {
    status,
    doneCount: done.length,
    totalCount,
    score10,
    attemptCount: done.reduce((s, g) => s + g.attemptCount, 0),
    submittedAt,
    isLate:
      submittedAt !== null &&
      submittedAt.getTime() > assignment.deadlineAt.getTime(),
    games,
  };
}
