import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PARENT_WEEKLY_WEEK_MESSAGE, ParentWeeklyScoresService } from './parent-weekly-scores.service';
import {
  PARENT_WEEKLY_AUTH_MESSAGE,
  readBearerToken,
  verifyPortalInternalKey,
  verifyPortalSsoToken,
} from './portal-sso';

@Controller('parent')
export class ParentWeeklyScoresController {
  constructor(private readonly weeklyScoresService: ParentWeeklyScoresService) {}

  @Get('weekly-scores')
  async getWeeklyScores(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-wewin-portal-key') portalKey: string | undefined,
    @Query('weekKey') weekKey: string | undefined,
    @Query('week') week: string | undefined,
    @Query('year') year: string | undefined,
    @Query('studentId') studentId: string | undefined,
    @Res() res: Response,
  ) {
    const requestedStudentId = String(studentId || '').trim();
    const claims = verifyPortalSsoToken(readBearerToken(authorization));
    const sid = verifyPortalInternalKey(portalKey)
      ? requestedStudentId || claims?.sid || ''
      : claims?.sid || '';

    if (!sid) {
      return res.status(401).json({
        ok: false,
        message: PARENT_WEEKLY_AUTH_MESSAGE,
      });
    }

    if (requestedStudentId && requestedStudentId !== sid) {
      return res.status(401).json({
        ok: false,
        message: PARENT_WEEKLY_AUTH_MESSAGE,
      });
    }

    const weekWindow = this.weeklyScoresService.parseWeek({ weekKey, week, year });
    if (!weekWindow) {
      return res.status(400).json({
        ok: false,
        message: PARENT_WEEKLY_WEEK_MESSAGE,
      });
    }

    try {
      const payload = await this.weeklyScoresService.load(sid, weekWindow);
      return res.status(200).json(payload);
    } catch {
      return res.status(500).json({ ok: false, message: 'Lỗi hệ thống' });
    }
  }
}
