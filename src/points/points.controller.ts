import { Controller, Get, Post, Query } from '@nestjs/common';
import { PointsService } from './points.service';
import { ApiOperation } from '@nestjs/swagger';
import { GetRankingQueryDto } from './dto/get-rank-query.dto';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('/rank')
  @ApiOperation({ description: '항목 별 랭킹 조회' })
  async getRanking(@Query() query: GetRankingQueryDto) {
    return this.pointsService.getRanking(query.match);
  }
}
