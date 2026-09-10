import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PARENT_WEEKLY_WEEK_MESSAGE, ParentWeeklyScoresService } from './parent-weekly-scores.service';
import {
  PARENT_WEEKLY_AUTH_MESSAGE,
  readBearerToken,
  verifyPortalSsoToken,
} from './portal-sso';

@Controller('parent')
export class ParentWeeklyScoresController {
  constructor(private readonly weeklyScores: ParentWeeklyScoresService) {}

  @Get('weekly-scores')
  async weeklyScores(
    @Headers('authorization') authorization: string | undefined,
    @Query('weekKey') weekKey: string | undefined,
    @Query('week') week: string | undefined,
    @Query('year') year: string | undefined,
    @Query('studentId') studentId: string | undefined,
    @Res() res: Response,
  ) {
    const claims = verifyPortalSsoToken(readBearerToken(authorization));
    if (!claims) {
      return res.status(401).json({
        ok: false,
        message: PARENT_WEEKLY_AUTH_MESSAGE,
      });
    }

    const requestedStudentId = String(studentId || '').trim();
    if (requestedStudentId && requestedStudentId !== claims.sid) {
      return res.status(401).json({
        ok: false,
        message: PARENT_WEEKLY_AUTH_MESSAGE,
      });
    }

    const weekWindow = this.weeklyScores.parseWeek({ weekKey, week, year });
    if (!weekWindow) {
      return res.status(400).json({
        ok: false,
        message: PARENT_WEEKLY_WEEK_MESSAGE,
      });
    }

    try {
      const payload = await this.weeklyScores.load(claims.sid, weekWindow);
      return res.status(200).json(payload);
    } catch {
      return res.status(500).json({ ok: false, message: 'Lỗi hệ thống' });
    }
  }
}
