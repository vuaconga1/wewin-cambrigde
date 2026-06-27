import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { GameService } from './game.service';
import { GameUnit } from 'src/entities/game/game-unit.entity';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async getAllGames(@Query('bookType') bookType?: string) {
    return this.gameService.getAllGameUnits(bookType);
  }

  @Get('type/:bookType')
  async getGamesByType(@Param('bookType') bookType: string) {
    return this.gameService.getGameUnitsByType(bookType);
  }

  @Get(':slug')
  async getGameBySlug(@Param('slug') slug: string) {
    return this.gameService.getGameUnitBySlug(slug);
  }

  @Post()
  async createGameUnit(@Body() data: Partial<GameUnit>) {
    return this.gameService.createGameUnit(data);
  }

  @Put(':id')
  async updateGameUnit(@Param('id') id: string, @Body() data: Partial<GameUnit>) {
    return this.gameService.updateGameUnit(id, data);
  }

  @Delete(':id')
  async deleteGameUnit(@Param('id') id: string) {
    return this.gameService.deleteGameUnit(id);
  }
}
