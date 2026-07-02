import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/entities/student/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  private toPublic(student: Student) {
    return {
      id: student.id,
      playerId: student.playerId,
      name: student.name,
      isActive: student.isActive,
    };
  }

  async verifyByPlayerId(playerId: string) {
    const normalized = playerId.trim();
    const student = await this.repo.findOne({
      where: { playerId: normalized, isActive: true },
    });

    if (!student) {
      throw new NotFoundException('ID người chơi không hợp lệ');
    }

    return this.toPublic(student);
  }

  /**
   * Tìm-hoặc-tạo học sinh theo playerId (Mã HV).
   * Dùng khi học sinh nhảy từ web báo bài sang web games: nếu Mã HV chưa có
   * trong DB games thì tự động tạo mới, nếu có rồi thì trả về (và kích hoạt lại
   * nếu trước đó đã bị vô hiệu hóa).
   */
  async ensureByPlayerId(playerId: string, name?: string) {
    const normalized = playerId.trim();
    const fallbackName = (name && name.trim()) || normalized;

    const existing = await this.repo.findOne({
      where: { playerId: normalized },
    });

    if (existing) {
      let changed = false;
      if (!existing.isActive) {
        existing.isActive = true;
        changed = true;
      }
      // Cập nhật tên nếu học sinh chưa có tên hợp lệ (tên đang trùng mã HV).
      if (name && name.trim() && (!existing.name || existing.name === existing.playerId)) {
        existing.name = name.trim();
        changed = true;
      }
      if (changed) {
        const saved = await this.repo.save(existing);
        return this.toPublic(saved);
      }
      return this.toPublic(existing);
    }

    const student = this.repo.create({
      playerId: normalized,
      name: fallbackName,
      isActive: true,
    });
    const saved = await this.repo.save(student);
    return this.toPublic(saved);
  }

  async create(dto: CreateStudentDto) {
    const normalized = dto.playerId.trim();
    const existing = await this.repo.findOne({
      where: { playerId: normalized },
    });
    if (existing) {
      throw new ConflictException('ID người chơi đã tồn tại');
    }

    const student = this.repo.create({
      playerId: normalized,
      name: dto.name.trim(),
      isActive: true,
    });
    const saved = await this.repo.save(student);
    return this.toPublic(saved);
  }

  async findAll() {
    const students = await this.repo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return students.map((s) => this.toPublic(s));
  }

  async findOne(id: string) {
    const student = await this.repo.findOne({ where: { id, isActive: true } });
    if (!student) throw new NotFoundException('Học sinh không tồn tại');
    return this.toPublic(student);
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.repo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Học sinh không tồn tại');

    if (dto.playerId !== undefined) {
      const normalized = dto.playerId.trim();
      const duplicate = await this.repo.findOne({
        where: { playerId: normalized },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('ID người chơi đã tồn tại');
      }
      student.playerId = normalized;
    }

    if (dto.name !== undefined) {
      student.name = dto.name.trim();
    }

    const saved = await this.repo.save(student);
    return this.toPublic(saved);
  }

  async remove(id: string) {
    const student = await this.repo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Học sinh không tồn tại');
    student.isActive = false;
    await this.repo.save(student);
    return { message: 'Đã xóa học sinh' };
  }
}
