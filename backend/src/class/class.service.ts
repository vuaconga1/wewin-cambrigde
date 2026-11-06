import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { Classroom } from 'src/entities/class/classroom.entity';
import { ClassMember } from 'src/entities/class/class-member.entity';
import { ClassAssignment } from 'src/entities/class/class-assignment.entity';
import {
  ClassAuditAction,
  ClassAuditLog,
} from 'src/entities/class/class-audit-log.entity';
import { GameUnit } from 'src/entities/game/game-unit.entity';
import { User } from 'src/entities/user/user.entity';
import {
  AddMembersDto,
  CreateAssignmentsDto,
  CreateClassDto,
  GAME_KEYS,
  ListClassesDto,
  SearchStudentsDto,
  UpdateClassDto,
} from './dto/class.dto';
import { StaffActor } from './staff.guard';

const PAGE_SIZE = 20;

// Thứ tự & tên sách giống thư viện 5 cấp ở frontend (bookname của kids là tên giai đoạn)
const BOOK_LABELS: Record<string, string> = {
  'super-kids': 'WeWIN Super Kids',
  kids: 'Kids',
  starter: 'Starters',
  mover: 'Movers',
  flyer: 'Flyers',
};
const BOOK_ORDER = Object.keys(BOOK_LABELS);

function unitLabel(unit: { unit?: string; name: string }) {
  const prefix = unit.unit?.trim();
  if (!prefix || unit.name.toLowerCase().startsWith(prefix.toLowerCase())) {
    return unit.name;
  }
  return `${prefix} – ${unit.name}`;
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

@Injectable()
export class ClassService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Classroom)
    private readonly classRepo: Repository<Classroom>,
    @InjectRepository(ClassMember)
    private readonly memberRepo: Repository<ClassMember>,
    @InjectRepository(ClassAssignment)
    private readonly assignmentRepo: Repository<ClassAssignment>,
    @InjectRepository(ClassAuditLog)
    private readonly auditRepo: Repository<ClassAuditLog>,
    @InjectRepository(GameUnit)
    private readonly unitRepo: Repository<GameUnit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private audit(
    actor: StaffActor,
    action: ClassAuditAction,
    classId: string | null,
    detail: Record<string, unknown>,
    assignmentId: string | null = null,
    repo: Repository<ClassAuditLog> = this.auditRepo,
  ) {
    return repo.save(
      repo.create({
        action,
        actorId: actor.id,
        actorName: actor.name,
        classId,
        assignmentId,
        detail,
      }),
    );
  }

  async getClassOrFail(id: string) {
    const cls = await this.classRepo.findOne({ where: { id } });
    if (!cls) throw new NotFoundException('Lớp không tồn tại');
    return cls;
  }

  /* ---------------- Lớp ---------------- */

  async list(dto: ListClassesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? PAGE_SIZE;
    const qb = this.classRepo
      .createQueryBuilder('c')
      .loadRelationCountAndMap('c.memberCount', 'c.members')
      .loadRelationCountAndMap('c.assignmentCount', 'c.assignments')
      .orderBy('c.isActive', 'DESC')
      .addOrderBy('c.code', 'ASC', 'NULLS LAST')
      .addOrderBy('c.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const q = dto.q?.trim();
    if (q) {
      qb.where(
        new Brackets((w) =>
          w
            .where('c.code ILIKE :q', { q: `%${escapeLike(q)}%` })
            .orWhere('c.name ILIKE :q')
            .orWhere('c.description ILIKE :q'),
        ),
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async create(dto: CreateClassDto, actor: StaffActor) {
    const code = dto.code?.trim() || null;
    if (code && (await this.classRepo.findOne({ where: { code } }))) {
      throw new ConflictException('Mã lớp đã tồn tại');
    }
    const saved = await this.classRepo.save(
      this.classRepo.create({
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        source: 'manual',
        createdById: actor.id,
      }),
    );
    await this.audit(actor, 'create_class', saved.id, { name: saved.name, code });
    return saved;
  }

  async update(id: string, dto: UpdateClassDto, actor: StaffActor) {
    const cls = await this.getClassOrFail(id);
    if (dto.name !== undefined) cls.name = dto.name.trim();
    if (dto.description !== undefined) cls.description = dto.description.trim() || null;
    if (dto.isActive !== undefined) cls.isActive = dto.isActive;
    const saved = await this.classRepo.save(cls);
    await this.audit(actor, 'update_class', id, { ...dto });
    return saved;
  }

  async remove(id: string, actor: StaffActor) {
    const cls = await this.getClassOrFail(id);
    await this.classRepo.delete(id);
    await this.audit(actor, 'delete_class', id, { name: cls.name, code: cls.code });
    return { message: 'Đã xóa lớp' };
  }

  async detail(id: string) {
    const cls = await this.getClassOrFail(id);
    const members = await this.memberRepo
      .createQueryBuilder('m')
      .innerJoin('m.user', 'u')
      .select(['m.id', 'm.addedAt', 'u.id', 'u.username', 'u.name', 'u.isActive'])
      .where('m.classId = :id', { id })
      .orderBy('u.name', 'ASC')
      .getRawMany<{
        m_added_at: Date;
        u_id: string;
        u_username: string;
        u_name: string;
        u_is_active: boolean;
      }>();
    const assignments = await this.assignmentRepo.find({
      where: { classId: id },
      order: { deadlineAt: 'DESC' },
    });

    return {
      ...cls,
      members: members.map((m) => ({
        userId: m.u_id,
        username: m.u_username,
        name: m.u_name,
        isActive: m.u_is_active,
        addedAt: m.m_added_at,
      })),
      assignments,
    };
  }

  /* ---------------- Thành viên ---------------- */

  async searchStudents(dto: SearchStudentsDto) {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.username', 'u.name'])
      .where('u.role = 0')
      .andWhere('u.username IS NOT NULL')
      .andWhere('u.isActive = true')
      .orderBy('u.username', 'ASC')
      .take(20);

    const q = dto.q?.trim();
    if (q) {
      qb.andWhere(
        new Brackets((w) =>
          w
            .where('u.username ILIKE :q', { q: `%${escapeLike(q)}%` })
            .orWhere('u.name ILIKE :q'),
        ),
      );
    }
    if (dto.excludeClassId) {
      qb.andWhere(
        `NOT EXISTS (SELECT 1 FROM class_members cm WHERE cm.user_id = u.id AND cm.class_id = :cid)`,
        { cid: dto.excludeClassId },
      );
    }
    return qb.getMany();
  }

  async addMembers(id: string, dto: AddMembersDto, actor: StaffActor) {
    await this.getClassOrFail(id);
    const users = await this.userRepo.find({
      where: { id: In(dto.userIds), role: 0, isActive: true },
      select: ['id', 'username'],
    });
    const valid = users.filter((u) => u.username);
    if (valid.length !== dto.userIds.length) {
      throw new BadRequestException(
        'Chỉ thêm được tài khoản học viên (có Mã HV) đang hoạt động',
      );
    }

    const result = await this.memberRepo
      .createQueryBuilder()
      .insert()
      .values(valid.map((u) => ({ classId: id, userId: u.id })))
      .orIgnore()
      .execute();
    const added = result.identifiers.filter(Boolean).length;

    await this.audit(actor, 'add_members', id, {
      usernames: valid.map((u) => u.username),
      added,
    });
    return { added };
  }

  async removeMember(id: string, userId: string, actor: StaffActor) {
    await this.getClassOrFail(id);
    const member = await this.memberRepo.findOne({
      where: { classId: id, userId },
      relations: ['user'],
    });
    if (!member) throw new NotFoundException('Học viên không thuộc lớp này');
    await this.memberRepo.delete(member.id);
    await this.audit(actor, 'remove_member', id, {
      username: member.user?.username,
    });
    return { message: 'Đã gỡ học viên' };
  }

  /* ---------------- Catalog & giao bài ---------------- */

  async catalog() {
    const units = await this.unitRepo.find({
      where: { isActive: true },
      order: { createAt: 'ASC' },
    });

    const books = new Map<
      string,
      {
        bookType: string;
        bookName: string;
        units: {
          slug: string;
          name: string;
          unit: string;
          parts: { id: string; title: string }[];
        }[];
      }
    >();
    for (const u of units) {
      const book = books.get(u.bookType) ?? {
        bookType: u.bookType,
        bookName: BOOK_LABELS[u.bookType] ?? u.bookname,
        units: [],
      };
      book.units.push({
        slug: u.slug,
        name: unitLabel(u),
        unit: u.unit,
        parts: u.parts?.length
          ? u.parts.map((p) => ({ id: p.id, title: p.title }))
          : [{ id: 'default', title: u.name }],
      });
      books.set(u.bookType, book);
    }
    const rank = (t: string) =>
      BOOK_ORDER.includes(t) ? BOOK_ORDER.indexOf(t) : BOOK_ORDER.length;
    return {
      games: GAME_KEYS,
      books: [...books.values()].sort((a, b) => rank(a.bookType) - rank(b.bookType)),
    };
  }

  async createAssignments(
    id: string,
    dto: CreateAssignmentsDto,
    actor: StaffActor,
  ) {
    await this.getClassOrFail(id);

    const slugs = [...new Set(dto.items.map((i) => i.unitSlug.trim()))];
    const units = await this.unitRepo.find({
      where: { slug: In(slugs), isActive: true },
    });
    const unitMap = new Map(units.map((u) => [u.slug, u]));
    const now = Date.now();

    const rows = dto.items.map((item, index) => {
      const line = `Dòng ${index + 1}`;
      const unit = unitMap.get(item.unitSlug.trim());
      if (!unit) {
        throw new BadRequestException(`${line}: bài học không tồn tại hoặc đã tắt`);
      }
      const partId = item.partId.trim();
      const part = unit.parts?.length
        ? unit.parts.find((p) => p.id === partId)
        : partId === 'default'
          ? { id: 'default', title: null }
          : undefined;
      if (!part) {
        throw new BadRequestException(`${line}: không tìm thấy lesson "${partId}"`);
      }
      const deadline = new Date(item.deadlineAt);
      if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= now) {
        throw new BadRequestException(`${line}: hạn nộp phải sau thời điểm hiện tại`);
      }
      const gameTypes = item.gameTypes?.length
        ? GAME_KEYS.filter((g) => item.gameTypes!.includes(g))
        : [...GAME_KEYS];

      return {
        classId: id,
        bookType: unit.bookType,
        unitSlug: unit.slug,
        partId,
        gameTypes,
        bookName: BOOK_LABELS[unit.bookType] ?? unit.bookname,
        unitName: unitLabel(unit),
        partTitle: part.title ?? null,
        deadlineAt: deadline,
        createdById: actor.id,
      };
    });

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ClassAssignment);
      const saved = await repo.save(rows.map((r) => repo.create(r)));
      const auditRepo = manager.getRepository(ClassAuditLog);
      for (const a of saved) {
        await this.audit(
          actor,
          'assign',
          id,
          {
            unitSlug: a.unitSlug,
            partId: a.partId,
            gameTypes: a.gameTypes,
            deadlineAt: a.deadlineAt,
          },
          a.id,
          auditRepo,
        );
      }
      return saved;
    });
  }

  private async getAssignmentOrFail(classId: string, assignmentId: string) {
    const a = await this.assignmentRepo.findOne({
      where: { id: assignmentId, classId },
    });
    if (!a) throw new NotFoundException('Bài tập không tồn tại trong lớp này');
    return a;
  }

  async updateDeadline(
    classId: string,
    assignmentId: string,
    deadlineAt: string,
    actor: StaffActor,
  ) {
    const a = await this.getAssignmentOrFail(classId, assignmentId);
    const deadline = new Date(deadlineAt);
    if (Number.isNaN(deadline.getTime())) {
      throw new BadRequestException('Hạn nộp không hợp lệ');
    }
    const old = a.deadlineAt;
    a.deadlineAt = deadline;
    const saved = await this.assignmentRepo.save(a);
    await this.audit(
      actor,
      'update_deadline',
      classId,
      { old, new: deadline, unitSlug: a.unitSlug, partId: a.partId },
      a.id,
    );
    return saved;
  }

  async removeAssignment(
    classId: string,
    assignmentId: string,
    actor: StaffActor,
  ) {
    const a = await this.getAssignmentOrFail(classId, assignmentId);
    await this.assignmentRepo.delete(a.id);
    await this.audit(
      actor,
      'delete_assignment',
      classId,
      { unitSlug: a.unitSlug, partId: a.partId, deadlineAt: a.deadlineAt },
      a.id,
    );
    return { message: 'Đã xóa bài tập' };
  }

  async auditLogs(classId: string | undefined, page = 1) {
    const [items, total] = await this.auditRepo.findAndCount({
      where: classId ? { classId } : {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * 50,
      take: 50,
    });
    return { items, total, page, limit: 50 };
  }
}
