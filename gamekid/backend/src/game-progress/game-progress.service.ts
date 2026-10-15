import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/entities/student/student.entity';
import { GameProgress } from 'src/entities/game-progress/game-progress.entity';
import { GetGameProgressDto } from './dto/get-game-progress.dto';
import { SaveGameProgressDto } from './dto/save-game-progress.dto';

@Injectable()
export class GameProgressService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(GameProgress)
    private readonly progressRepo: Repository<GameProgress>,
  ) {}

  private normalizePartId(partId?: string) {
    return partId?.trim() || 'default';
  }

  private async resolveStudent(playerId: string) {
    return this.studentRepo.findOne({
      where: { playerId, isActive: true },
    });
  }

  private toResponse(row: GameProgress) {
    return {
      id: row.id,
      playerId: row.playerId,
      unitSlug: row.unitSlug,
      partId: row.partId,
      bookname: row.bookname,
      progress: row.progress ?? {},
      updatedAt: row.updateAt,
    };
  }

  async saveProgress(dto: SaveGameProgressDto) {
    const playerId = dto.playerId.trim();
    const unitSlug = dto.unitSlug.trim();
    const partId = this.normalizePartId(dto.partId);
    const bookname = dto.bookname.trim();

    const student = await this.resolveStudent(playerId);

    const existing = await this.progressRepo.findOne({
      where: { playerId, unitSlug, partId },
    });

    if (!existing) {
      const created = this.progressRepo.create({
        playerId,
        unitSlug,
        partId,
        bookname,
        progress: dto.progress ?? {},
        studentId: student?.id ?? null,
        student: student ?? null,
      });

      const saved = await this.progressRepo.save(created);
      return this.toResponse(saved);
    }

    // Merge progress: keep any previously completed game as true
    existing.bookname = bookname;
    existing.progress = {
      ...(existing.progress || {}),
      ...(dto.progress || {}),
    };

    existing.studentId = student?.id ?? null;
    existing.student = student ?? null;

    const saved = await this.progressRepo.save(existing);
    return this.toResponse(saved);
  }

  async getProgress(dto: GetGameProgressDto) {
    const playerId = dto.playerId.trim();
    const unitSlug = dto.unitSlug.trim();
    const partId = this.normalizePartId(dto.partId);

    const row = await this.progressRepo.findOne({
      where: { playerId, unitSlug, partId },
    });

    return row ? this.toResponse(row) : null;
  }

  async clearProgress(dto: GetGameProgressDto) {
    const playerId = dto.playerId.trim();
    const unitSlug = dto.unitSlug.trim();
    const partId = this.normalizePartId(dto.partId);

    const result = await this.progressRepo.delete({
      playerId,
      unitSlug,
      partId,
    });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException('Không tìm thấy tiến độ cần xoá');
    }

    return { deleted: true };
  }
}