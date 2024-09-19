import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateBetAnswerDto,
  CreateBetAnswerResponseDto,
} from './dto/create-bet-answer.dto';
import { AuthGuard } from '@nestjs/passport';
import { betQuestionResponseDto } from './dto/get-bet-question.dto';
import { ToTalPredictionDto } from './dto/get-total-prediction.dto';
import { ParticipantsResponseDto } from './dto/get-participants.dto';
import { InputAnswerDto } from './dto/input-answer.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/common/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { AccessUser } from 'src/common/decorators/accessUser.decorator';
import { JwtPayload } from 'src/common/interfaces/auth.interface';
import { GetRankDto } from './dto/get-rank.dto';
import { betAnswerResponseDto } from './dto/get-bet-answer.dto';
import {
  RankPageOptionsDto,
  RankPageResponseDto,
} from './dto/get-rank-page.dto';

@ApiTags('bets')
@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get('/questions')
  @ApiOperation({
    summary: '질문 목록 조회',
    description:
      '질문 목록 및 각 질문 별 전체 사용자의 베팅 비율을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '질문 목록 조회 성공',
    type: betQuestionResponseDto,
  })
  // TODO: cache
  async getBetQuestions(): Promise<betQuestionResponseDto> {
    try {
      return this.betsService.getBetInfo();
    } catch (err) {
      console.log(err);
    }
  }

  @Get('/bet')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '배팅 항목 조회',
    description: '각 질문별로 사용자가 배팅한 항목들을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '베팅 항목 조회 성공',
    type: betAnswerResponseDto,
  })
  async getBetAnswers(@AccessUser() user: JwtPayload) {
    return this.betsService.getBetAnswers(user.id);
  }

  @Post('/bet')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
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
    @AccessUser() user: JwtPayload,
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
        user.id,
        createBetAnswerDto,
      );
      res.status(result.status).json({ percentage: result.percentage });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
    }
  }

  @Get('/share/prediction')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
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
  async getTotalPredictions(@AccessUser() user: JwtPayload) {
    return this.betsService.getTotalPredictions(user.id);
  }

  @Post('/share/prediction')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
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
  async getSharePredictionTicket(@AccessUser() user: JwtPayload) {
    return this.betsService.getSharePredictionTicket(user.id);
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

  @Post('/answer')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '실제 정답 입력',
    description: '베팅 문제들의 실제 정답을 입력합니다',
  })
  @ApiBody({
    type: InputAnswerDto,
  })
  @ApiResponse({
    status: 201,
    description: '정답 입력 성공',
  })
  async inputAnswer(
    @TransactionManager() transactionManager: EntityManager,
    @Body() inputAnswerDto: InputAnswerDto,
  ): Promise<void> {
    return this.betsService.inputAnswer(inputAnswerDto, transactionManager);
  }

  @Get('/rank')
  @ApiOperation({
    summary: '랭킹 조회하기',
    description: '전체 랭킹 리스트를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전체 랭킹 목록 조회 성공',
    type: RankPageResponseDto,
  })
  async getRank(@Query() requestDto: RankPageOptionsDto) {
    return this.betsService.getRankList(requestDto);
  }

  @Get('/rank/my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 랭킹 조회하기',
    description: '내 랭킹을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '내 랭킹 조회 성공',
    type: GetRankDto,
  })
  async getMyRank(@AccessUser() user: JwtPayload) {
    return this.betsService.getRankById(user.id);
  }

  @Post('/share/rank')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '랭킹 공유 응모권 획득',
    description:
      '사용자가 랭킹을 공유한 후 응모권를 획득합니다. 하루에 한번만 가능합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '랭킹 공유 응모권 획득 성공, 획득 후 응모권 갯수 반환',
    type: Number,
  })
  async getShareRankTicket(@AccessUser() user: JwtPayload) {
    return this.betsService.getShareRankTicket(user.id);
  }
}
