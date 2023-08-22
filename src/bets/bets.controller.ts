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
      const limitMap = {
        1: '2023-09-08T02:00:00Z',
        2: '2023-09-08T05:00:00Z',
        3: '2023-09-08T08:00:00Z',
        4: '2023-09-09T02:00:00Z',
        5: '2023-09-09T05:00:00Z',
      };

      if (
        Date.now() >
        new Date(
          limitMap[Math.ceil(createBetAnswerDto.questionId / 5)],
        ).getTime()
      ) {
        throw new Error('베팅 기간이 아닙니다.');
      }

      const result = await this.betsService.createOrUpdateAnswer(
        req.user.id,
        createBetAnswerDto,
      );
      res.status(result.status).json({ percentage: result.percentage });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
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
