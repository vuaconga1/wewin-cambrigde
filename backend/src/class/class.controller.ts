import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ClassService } from './class.service';
import { HomeworkService } from './homework.service';
import { StaffGuard } from './staff.guard';
import type { StaffRequest } from './staff.guard';
import {
  AddMembersDto,
  AuditLogQueryDto,
  CreateAssignmentsDto,
  CreateClassDto,
  ListClassesDto,
  SearchStudentsDto,
  UpdateAssignmentDto,
  UpdateClassDto,
} from './dto/class.dto';

@UseGuards(StaffGuard)
@Controller('classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly homeworkService: HomeworkService,
  ) {}

  // Các route tĩnh phải đứng trước ':id'
  @Get('students')
  searchStudents(@Query() dto: SearchStudentsDto) {
    return this.classService.searchStudents(dto);
  }

  @Get('catalog')
  catalog() {
    return this.classService.catalog();
  }

  @Get('audit-logs')
  auditLogs(@Query() dto: AuditLogQueryDto) {
    return this.classService.auditLogs(dto.classId, dto.page);
  }

  @Get()
  list(@Query() dto: ListClassesDto) {
    return this.classService.list(dto);
  }

  @Post()
  create(@Body() dto: CreateClassDto, @Req() req: StaffRequest) {
    return this.classService.create(dto, req.staff);
  }

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.detail(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassDto,
    @Req() req: StaffRequest,
  ) {
    return this.classService.update(id, dto, req.staff);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: StaffRequest) {
    return this.classService.remove(id, req.staff);
  }

  @Post(':id/members')
  addMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMembersDto,
    @Req() req: StaffRequest,
  ) {
    return this.classService.addMembers(id, dto, req.staff);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: StaffRequest,
  ) {
    return this.classService.removeMember(id, userId, req.staff);
  }

  @Post(':id/assignments')
  createAssignments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAssignmentsDto,
    @Req() req: StaffRequest,
  ) {
    return this.classService.createAssignments(id, dto, req.staff);
  }

  @Patch(':id/assignments/:aid')
  updateAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('aid', ParseUUIDPipe) aid: string,
    @Body() dto: UpdateAssignmentDto,
    @Req() req: StaffRequest,
  ) {
    return this.classService.updateDeadline(id, aid, dto.deadlineAt, req.staff);
  }

  @Delete(':id/assignments/:aid')
  removeAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('aid', ParseUUIDPipe) aid: string,
    @Req() req: StaffRequest,
  ) {
    return this.classService.removeAssignment(id, aid, req.staff);
  }

  @Get(':id/progress')
  progress(@Param('id', ParseUUIDPipe) id: string) {
    return this.homeworkService.classProgress(id);
  }

  @Get(':id/export')
  async export(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { filename, content } = await this.homeworkService.classProgressCsv(id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }
}
