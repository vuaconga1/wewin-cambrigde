import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { HomeworkService } from './homework.service';

class ByPlayerQuery {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  playerId: string;
}

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

@Controller('homework')
export class HomeworkController {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly homeworkService: HomeworkService) {}

  private summarize<T extends { isOverdue: boolean }>(items: T[]) {
    const overdueCount = items.filter((i) => i.isOverdue).length;
    return {
      success: true,
      count: items.length,
      overdueCount,
      upcomingCount: items.length - overdueCount,
      items,
    };
  }

  // Giới hạn đơn giản trong bộ nhớ, đủ cho 1 replica; chống dò Mã HV hàng loạt
  private checkRateLimit(req: Request) {
    const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0];
    const ip = forwarded.trim() || req.ip || 'unknown';
    const now = Date.now();
    const entry = this.hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      if (this.hits.size > 10_000) this.hits.clear();
      this.hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
      return;
    }
    entry.count += 1;
    if (entry.count > RATE_LIMIT) {
      throw new HttpException(
        'Quá nhiều yêu cầu, vui lòng thử lại sau',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('incomplete')
  async incomplete(@Req() req: Request & { user: { sub: string } }) {
    const { displayName, items } =
      await this.homeworkService.incompleteForUserId(req.user.sub);
    return { ...this.summarize(items), displayName };
  }

  /** Công khai: học viên vào bằng ?sid= hoặc nhập Mã HV. Không trả họ tên / điểm. */
  @Get('incomplete/by-player')
  async incompleteByPlayer(@Query() query: ByPlayerQuery, @Req() req: Request) {
    this.checkRateLimit(req);
    const { items } = await this.homeworkService.incompleteForPlayer(
      query.playerId,
    );
    return this.summarize(items);
  }
}
