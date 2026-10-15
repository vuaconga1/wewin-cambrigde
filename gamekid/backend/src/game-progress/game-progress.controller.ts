import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { GameProgressService } from './game-progress.service';
import { GetGameProgressDto } from './dto/get-game-progress.dto';
import { SaveGameProgressDto } from './dto/save-game-progress.dto';

@Controller('game-progress')
export class GameProgressController {
  constructor(private readonly gameProgressService: GameProgressService) {}

  @Get()
  get(@Query() query: GetGameProgressDto) {
    return this.gameProgressService.getProgress(query);
  }

  @Post('save')
  save(@Body() body: SaveGameProgressDto) {
    return this.gameProgressService.saveProgress(body);
  }

  @Delete()
  clear(@Query() query: GetGameProgressDto) {
    return this.gameProgressService.clearProgress(query);
  }
}