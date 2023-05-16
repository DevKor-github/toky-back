import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { ApiOperation } from '@nestjs/swagger';
import { GetRankingQueryDto } from './dto/get-rank-query.dto';
import { DefaultUserInterceptor } from 'src/auth/interceptor/default-user.interceptor';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { DrawGiftDto } from './dto/draw-gift.dto';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('/rank')
  @ApiOperation({ description: '항목 별 랭킹 조회' })
  async getRanking(@Query() query: GetRankingQueryDto) {
    return this.pointsService.getRanking(query.match);
  }

  @Post('/draw')
  @UseInterceptors(DefaultUserInterceptor)
  @ApiOperation({ description: '경품 응모' })
  async drawForGift(
    @CurrentUser() user: UserEntity,
    @Body() drawGiftDto: DrawGiftDto,
  ) {
    return this.pointsService.drawForGift(drawGiftDto.giftId, user);
  }
}
