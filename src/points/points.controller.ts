import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { ApiOperation } from '@nestjs/swagger';
import { Req } from '@nestjs/common';
import { DrawGiftDto } from './dto/draw-gift.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('/gifts')
  @ApiOperation({ description: '경품 리스트 조회' })
  @UseGuards(AuthGuard('jwt'))
  async getGifts() {
    return this.pointsService.getGifts();
  }

  @Get('/rank')
  @ApiOperation({ description: '전체 랭킹 조회' })
  @UseGuards(AuthGuard('jwt'))
  async getRanking(@Query('page', ParseIntPipe) page?: number) {
    return this.pointsService.getRanking(page || 1);
  }

  @Get('/rank/search')
  @ApiOperation({ description: '닉네임으로 랭킹 검색' })
  @UseGuards(AuthGuard('jwt'))
  async getRankingWithName(@Query('name') name: string) {
    const rank = await this.pointsService.getRankByName(name);
    if (rank < 0) return null;

    return this.pointsService.getRankingListByRank(rank);
  }

  @Get('/rank/my')
  @ApiOperation({ description: '본인 랭킹 조회' })
  @UseGuards(AuthGuard('jwt'))
  async getMyRanking(@Req() req) {
    const rank = await this.pointsService.getRankById(req.user.id);
    if (rank < 0) return null;

    return this.pointsService.getRankingListByRank(rank);
  }

  @Get('/rank/info')
  @ApiOperation({ description: '본인 포인트와 랭킹 조회' })
  @UseGuards(AuthGuard('jwt'))
  async getMyRankingWithPoint(@Req() req) {
    return await this.pointsService.getRankInfo(req.user.id);
  }

  @Post('/draw')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '경품 응모' })
  async drawForGift(@Body() drawGiftDto: DrawGiftDto, @Req() req) {
    return this.pointsService.drawForGift(drawGiftDto.giftId, req.user);
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '본인 포인트 조회' })
  async getMyPoint(@Req() req) {
    return this.pointsService.getMyPoint(req.user.id);
  }

  @Get('/draw')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '본인 응모 및 전체 응모 수 확인' })
  async getMyDrawParticipants(@Req() req) {
    return this.pointsService.getAllandMyDrawParticipants(req.user.id);
  }

  @Get('/history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '본인 모든 히스토리 가져오기' })
  async getMyPointHistory(
    @Req() req,
    @Query('page', ParseIntPipe) page?: number,
  ) {
    return this.pointsService.getMyPointHistory(req.user.id, page || 1);
  }
}
