import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PointsService } from './points.service';
import { ApiOperation } from '@nestjs/swagger';
import { Req } from '@nestjs/common';
import { DrawGiftDto } from './dto/draw-gift.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('/rank')
  @ApiOperation({ description: '전체 랭킹 조회' })
  async getRanking() {
    return this.pointsService.getRanking();
  }

  @Post('/draw')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '경품 응모' })
  async drawForGift(@Body() drawGiftDto: DrawGiftDto, @Req() req) {
    return this.pointsService.drawForGift(drawGiftDto.giftId, req.user);
  }
}
