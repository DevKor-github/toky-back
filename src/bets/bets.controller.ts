import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateBetAnswerDto } from './dto/create-bet-answer.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get('/questions')
  @ApiOperation({ summary: '경기 별 베팅 항목 리스트 조회하기' })
  @UseGuards(AuthGuard('jwt'))
  // TODO: cache
  async getBetQuestions(@Req() req) {
    try {
      return this.betsService.getBetInfo(req.user.id);
    } catch (err) {
      console.log(err);
    }
  }

  @Post('/bet')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '베팅하기' })
  async createBetAnswer(
    @Req() req,
    @Body() createBetAnswerDto: CreateBetAnswerDto,
    @Res() res,
  ) {
    try {
      const result = await this.betsService.createOrUpdateAnswer(
        req.user.id,
        createBetAnswerDto,
      );
      res.status(result.status).json({ percentage: result.percentage });
    } catch (err) {
      console.log(err);
    }
  }

  @Get('/share')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '사용자의 종합 우승 스코어 조회하기' })
  async getTotalPredictions(@Req() req) {
    return this.betsService.getTotalPredictions(req.user.id);
  }

  @Get('/participants')
  @ApiOperation({ summary: '베팅 참여자 조회하기' })
  async getParticipants() {
    return this.betsService.getBetParticipants();
  }
}
