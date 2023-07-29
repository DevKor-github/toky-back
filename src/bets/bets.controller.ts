import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateBetAnswerDto } from './dto/create-bet-answer.dto';
import { UpdateBetAnswerDto } from './dto/update-bet-answer.dto';
import { Match } from 'src/common/enums/event.enum';
import { AuthGuard } from '@nestjs/passport';
import { CreateAnswerResDto } from './dto/create-answer-res-dto';

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get('/questions/:match')
  @ApiOperation({ summary: '경기 별 베팅 항목 리스트 조회하기' })
  async getBetQuestions(
    @Param('match', new ParseEnumPipe(Match)) match: Match,
  ) {
    return this.betsService.getBetQuestions(match);
  }

  //@ApiBearerAuth()
  @Post('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '베팅 항목 별 첫 베팅하기' })
  async createBetAnswer(
    @Req() req,
    @Body() createBetAnswerDto: CreateBetAnswerDto,
  ): Promise<CreateAnswerResDto> {
    return this.betsService.createBetAnswer(req.user.id, createBetAnswerDto);
  }

  //@ApiBearerAuth()
  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '사용자가 베팅한 이력 조회하기' })
  async getBetAnswers(@Req() req) {
    return this.betsService.getBetAnswers(req.user.id);
  }

  //@ApiBearerAuth()
  @Patch('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '사용자 베팅 수정하기' })
  async updateBetAnswer(
    @Body() updateBetAnswer: UpdateBetAnswerDto,
    @Req() req,
  ) {
    return this.betsService.updateBetAnswer(req.user.id, updateBetAnswer);
  }

  @Get('/share')
  //@UseGuards(AuthGuard('jwt'))
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
