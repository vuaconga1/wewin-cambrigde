import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { GetTopDto } from './dto/get-top.dto';
import { GetMonthlyTopDto } from './dto/get-monthly-top.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /** Public — học sinh submit điểm (best-score + monthly) */
  @Post('submit')
  submit(@Body() body: SubmitScoreDto) {
    return this.leaderboardService.submitBestScore(body);
  }

  /** Public — lấy top N theo game */
  @Get('top')
  top(@Query() query: GetTopDto) {
    return this.leaderboardService.getTop(query);
  }

  /** Public — bảng xếp hạng tháng theo sách */
  @Get('monthly-top')
  monthlyTop(@Query() query: GetMonthlyTopDto) {
    return this.leaderboardService.getMonthlyTop(query);
  }
}
