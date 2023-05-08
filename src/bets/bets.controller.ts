import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateBetAnswerDto } from './dto/create-bet-answer.dto';
import { UpdateBetAnswerDto } from './dto/update-bet-answer.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { Match } from 'src/common/enums/event.enum';
import { DefaultUserInterceptor } from 'src/auth/interceptor/default-user.interceptor';

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
  //@UseGuards(JwtAuthGuard)
  @UseInterceptors(DefaultUserInterceptor)
  @ApiOperation({ summary: '베팅 항목 별 첫 베팅하기' })
  async createBetAnswer(
    @Body() createBetAnswerDto: CreateBetAnswerDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.betsService.createBetAnswer(user, createBetAnswerDto);
  }

  //@ApiBearerAuth()
  @Get('/')
  //@UseGuards(JwtAuthGuard)
  @UseInterceptors(DefaultUserInterceptor)
  @ApiOperation({ summary: '사용자가 베팅한 이력 조회하기' })
  async getBetAnswers(@CurrentUser() user: UserEntity) {
    return this.betsService.getBetAnswers(user.id);
  }

  //@ApiBearerAuth()
  @Patch('/')
  //@UseGuards(JwtAuthGuard)
  @UseInterceptors(DefaultUserInterceptor)
  @ApiOperation({ summary: '사용자 베팅 수정하기' })
  async updateBetAnswer(
    @Body() updateBetAnswer: UpdateBetAnswerDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.betsService.updateBetAnswer(user.id, updateBetAnswer);
  }
}
