import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { VerifyPlayerIdDto } from './dto/verify-player-id.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  /** Public — học sinh xác thực ID khi chơi game (không cần đăng nhập) */
  @Post('verify')
  verify(@Body() body: VerifyPlayerIdDto) {
    return this.studentService.verifyByPlayerId(body.playerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: CreateStudentDto) {
    return this.studentService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateStudentDto) {
    return this.studentService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }
}
