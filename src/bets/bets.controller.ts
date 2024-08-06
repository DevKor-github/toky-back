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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateBetAnswerDto,
  CreateBetAnswerResponseDto,
} from './dto/create-bet-answer.dto';
import { AuthGuard } from '@nestjs/passport';
import { betQuestionResponseDto } from './dto/betQuestionResponse.dto';
import { ToTalPredictionDto } from './dto/totalPrediction.dto';
import { ParticipantsResponseDto } from './dto/participantsResponse.dto';

@ApiTags('bets')
@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get('/questions')
  @ApiOperation({
    summary: '질문 목록 조회',
    description:
      '질문 목록 및 각 질문 별 전체 사용자의 베팅 비율, 현재 유저가 이미 베팅했을 경유 유저가 베팅한 항목을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '질문 목록 조회 성공',
    type: [betQuestionResponseDto],
  })
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
  @ApiOperation({
    summary: '베팅하기',
    description:
      '각 질문별로 베팅을 수행합니다. 이미 베팅한 적이 있으면 베팅을 수정합니다.',
  })
  @ApiBody({
    type: CreateBetAnswerDto,
  })
  @ApiResponse({
    status: 201,
    description: '신규 베팅 성공',
    type: CreateBetAnswerResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: '베팅 수정 성공',
    type: CreateBetAnswerResponseDto,
  })
  async createBetAnswer(
    @Req() req,
    @Body() createBetAnswerDto: CreateBetAnswerDto,
    @Res() res,
  ) {
    try {
      // const limitMap = {
      //   1: '2023-09-08T02:00:00Z',
      //   2: '2023-09-08T05:00:00Z',
      //   3: '2023-09-08T08:00:00Z',
      //   4: '2023-09-09T02:00:00Z',
      //   5: '2023-09-09T05:00:00Z',
      // };

      // if (
      //   Date.now() >
      //   new Date(
      //     limitMap[Math.ceil(createBetAnswerDto.questionId / 5)],
      //   ).getTime()
      // ) {
      //   throw new Error('베팅 기간이 아닙니다.');
      // }

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
  @ApiOperation({
    summary: '종합 예측 우승 스코어 조회',
    description:
      '사용자가 예측한 종합 우승 스코어를 조회합니다. (for 공유하기 기능)',
  })
  @ApiResponse({
    status: 200,
    description: '종합 우승스코어 조회 성공',
    type: ToTalPredictionDto,
  })
  async getTotalPredictions(@Req() req) {
    return this.betsService.getTotalPredictions(req.user.id);
  }

  @Post('/share')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '예측 공유 응모권 획득',
    description:
      '사용자가 승부예측을 공유한 후 응모권를 획득합니다. 하루에 한번만 가능합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '예측 공유 응모권 획득 성공, 획득 후 응모권 갯수 반환',
    type: Number,
  })
  async getSharePredictionTicket(@Req() req) {
    return this.betsService.getSharePredictionTicket(req.user.id);
  }

  @Get('/participants')
  @ApiOperation({
    summary: '베팅 참여자 조회하기',
    description: '고려대 가입자 수와 연세대 가입자 수를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '베팅 참여자 조회 성공',
    type: ParticipantsResponseDto,
  })
  async getParticipants() {
    return this.betsService.getBetParticipants();
  }
}
