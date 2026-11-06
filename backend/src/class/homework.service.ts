import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClassAssignment } from 'src/entities/class/class-assignment.entity';
import { ClassMember } from 'src/entities/class/class-member.entity';
import { GameAttempt } from 'src/entities/game-attempt/game-attempt.entity';
import { User } from 'src/entities/user/user.entity';
import { computeHomeworkProgress, HomeworkProgress } from './homework-progress';
import {
  assignmentTitle,
  formatVnDateTime,
  toCsv,
} from './homework-format';
import { ClassService } from './class.service';

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

type AttemptRow = Pick<
  GameAttempt,
  'playerId' | 'unitSlug' | 'partId' | 'gameType' | 'score' | 'maxScore' | 'createdAt'
>;

const attemptKey = (playerId: string, unitSlug: string, partId: string) =>
  `${playerId.toLowerCase()}|${unitSlug}|${partId}`;

@Injectable()
export class HomeworkService {
  constructor(
    private readonly classService: ClassService,
    @InjectRepository(ClassAssignment)
    private readonly assignmentRepo: Repository<ClassAssignment>,
    @InjectRepository(ClassMember)
    private readonly memberRepo: Repository<ClassMember>,
    @InjectRepository(GameAttempt)
    private readonly attemptRepo: Repository<GameAttempt>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Một query cho toàn bộ attempt liên quan, gom theo (Mã HV, unit, lesson) */
  private async loadAttempts(
    playerIds: string[],
    assignments: ClassAssignment[],
  ) {
    const grouped = new Map<string, AttemptRow[]>();
    if (playerIds.length === 0 || assignments.length === 0) return grouped;

    const since = new Date(
      Math.min(...assignments.map((a) => a.createdAt.getTime())),
    );
    const rows = await this.attemptRepo
      .createQueryBuilder('a')
      .select([
        'a.playerId',
        'a.unitSlug',
        'a.partId',
        'a.gameType',
        'a.score',
        'a.maxScore',
        'a.createdAt',
      ])
      .where('LOWER(a.playerId) IN (:...ids)', {
        ids: [...new Set(playerIds.map((p) => p.toLowerCase()))],
      })
      .andWhere('a.unitSlug IN (:...slugs)', {
        slugs: [...new Set(assignments.map((a) => a.unitSlug))],
      })
      .andWhere('a.createdAt >= :since', { since })
      .getMany();

    for (const r of rows) {
      const key = attemptKey(r.playerId, r.unitSlug, r.partId);
      const list = grouped.get(key) ?? [];
      list.push(r);
      grouped.set(key, list);
    }
    return grouped;
  }

  private progressOf(
    assignment: ClassAssignment,
    username: string,
    attempts: Map<string, AttemptRow[]>,
  ) {
    return computeHomeworkProgress(
      assignment,
      attempts.get(attemptKey(username, assignment.unitSlug, assignment.partId)) ??
        [],
    );
  }

  /* ---------------- Tiến độ lớp (giáo viên) ---------------- */

  async classProgress(classId: string) {
    const cls = await this.classService.detail(classId);
    const attempts = await this.loadAttempts(
      cls.members.map((m) => m.username),
      cls.assignments,
    );

    const cells: Record<string, Record<string, HomeworkProgress>> = {};
    for (const a of cls.assignments) {
      cells[a.id] = {};
      for (const m of cls.members) {
        cells[a.id][m.userId] = this.progressOf(a, m.username, attempts);
      }
    }

    return {
      classId,
      assignments: cls.assignments.map((a) => ({
        id: a.id,
        title: assignmentTitle(a),
        gameTypes: a.gameTypes,
        deadlineAt: a.deadlineAt,
        createdAt: a.createdAt,
      })),
      students: cls.members.map((m) => ({
        userId: m.userId,
        username: m.username,
        name: m.name,
      })),
      cells,
    };
  }

  async classProgressCsv(classId: string) {
    const cls = await this.classService.getClassOrFail(classId);
    const p = await this.classProgress(classId);
    const header = [
      'Mã HV',
      'Họ tên',
      ...p.assignments.map(
        (a) => `${a.title} (hạn ${formatVnDateTime(new Date(a.deadlineAt))})`,
      ),
    ];
    const rows = p.students.map((s) => [
      s.username,
      s.name,
      ...p.assignments.map((a) => {
        const c = p.cells[a.id][s.userId];
        if (c.status === 'pending') return 'Chưa làm';
        if (c.status === 'in_progress') {
          return `Đang làm ${c.doneCount}/${c.totalCount}`;
        }
        const score = c.score10 ?? '-';
        const when = c.submittedAt ? formatVnDateTime(c.submittedAt) : '';
        return `${score} điểm, nộp ${when}${c.isLate ? ' (trễ)' : ''}`;
      }),
    ]);
    return {
      filename: `tien-do-${cls.code || cls.id}.csv`,
      content: toCsv([header, ...rows]),
    };
  }

  /* ---------------- Bài chưa làm (học viên) ---------------- */

  async incompleteForPlayer(playerId: string) {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.username', 'u.name'])
      .where('LOWER(u.username) = LOWER(:playerId)', { playerId: playerId.trim() })
      .andWhere('u.role = 0')
      .andWhere('u.isActive = true')
      .getOne();
    if (!user?.username) return { displayName: null, items: [] as HomeworkItem[] };
    return { displayName: user.name, items: await this.incompleteForUser(user) };
  }

  async incompleteForUserId(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId, isActive: true },
      select: ['id', 'username', 'name'],
    });
    if (!user?.username) return { displayName: user?.name ?? null, items: [] };
    return { displayName: user.name, items: await this.incompleteForUser(user) };
  }

  private async incompleteForUser(user: Pick<User, 'id' | 'username'>) {
    const memberships = await this.memberRepo
      .createQueryBuilder('m')
      .innerJoinAndSelect('m.classroom', 'c')
      .where('m.userId = :uid', { uid: user.id })
      .andWhere('c.isActive = true')
      .getMany();
    if (memberships.length === 0) return [];

    const classes = new Map(memberships.map((m) => [m.classId, m.classroom!]));
    const assignments = await this.assignmentRepo.find({
      where: { classId: In([...classes.keys()]) },
    });
    const attempts = await this.loadAttempts([user.username!], assignments);
    const now = Date.now();

    const items: HomeworkItem[] = [];
    for (const a of assignments) {
      const p = this.progressOf(a, user.username!, attempts);
      if (p.status === 'done') continue;
      const cls = classes.get(a.classId)!;
      items.push({
        assignmentId: a.id,
        className: cls.code || cls.name,
        title: assignmentTitle(a),
        bookType: a.bookType,
        unitSlug: a.unitSlug,
        partId: a.partId,
        gameTypes: a.gameTypes,
        doneCount: p.doneCount,
        totalCount: p.totalCount,
        deadlineAt: a.deadlineAt.toISOString(),
        deadlineDisplay: formatVnDateTime(a.deadlineAt),
        isOverdue: a.deadlineAt.getTime() < now,
        isNew: now - a.createdAt.getTime() < NEW_WINDOW_MS,
      });
    }

    return items.sort(
      (x, y) =>
        Number(y.isOverdue) - Number(x.isOverdue) ||
        x.deadlineAt.localeCompare(y.deadlineAt),
    );
  }
}

export type HomeworkItem = {
  assignmentId: string;
  className: string;
  title: string;
  bookType: string;
  unitSlug: string;
  partId: string;
  gameTypes: string[];
  doneCount: number;
  totalCount: number;
  deadlineAt: string;
  deadlineDisplay: string;
  isOverdue: boolean;
  isNew: boolean;
};
