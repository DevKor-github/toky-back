import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AttendanceCheckService } from './attendance-check.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { TransactionManager } from 'src/common/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import {
  SubmitAttendanceCheckQuizRequestDto,
  SubmitAttendanceCheckQuizResponseDto,
} from './dto/submit-attendance-check-quiz.dto';
import { AccessUser } from 'src/common/decorators/accessUser.decorator';
import { JwtPayload } from 'src/common/interfaces/auth.interface';
import { GetTodayAttendanceCheckQuizResponseDto } from './dto/get-today-attendance-check-quiz.dto';
import { GetAttendanceResponseDto } from './dto/get-my-attendance.dto';

@ApiTags('attendance-check')
@Controller('attendance-check')
export class AttendanceCheckController {
  constructor(
    private readonly attendanceCheckService: AttendanceCheckService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '출석체크 퀴즈 제출' })
  @ApiBody({
    type: SubmitAttendanceCheckQuizRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '출석체크 퀴즈 제출 성공',
    type: SubmitAttendanceCheckQuizResponseDto,
  })
  @UseInterceptors(TransactionInterceptor)
  async submitAttendanceCheckQuiz(
    @TransactionManager() transactionManager: EntityManager,
    @AccessUser() user: JwtPayload,
    @Body()
    submitAttendanceCheckQuizRequestDto: SubmitAttendanceCheckQuizRequestDto,
  ): Promise<SubmitAttendanceCheckQuizResponseDto> {
    return this.attendanceCheckService.submitAttendanceCheckQuiz(
      transactionManager,
      user.id,
      submitAttendanceCheckQuizRequestDto,
    );
  }

  @Get('today-quiz')
  @ApiOperation({
    summary: '오늘의 출석체크 퀴즈 보기',
  })
  @ApiResponse({
    status: 200,
    description: '오늘의 출석체크 퀴즈 조회 성공',
    type: GetTodayAttendanceCheckQuizResponseDto,
  })
  async getTodayAttendanceCheckQuiz(): Promise<GetTodayAttendanceCheckQuizResponseDto> {
    return this.attendanceCheckService.getTodayAttendanceCheckQuiz();
  }

  @Get('my-attendance')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '나의 출석 체크 현황 보기 ',
  })
  @ApiResponse({
    status: 200,
    description: '나의 출석 체크 현황 조회 성공',
    type: GetAttendanceResponseDto,
  })
  async getMyAttendance(
    @AccessUser() user: JwtPayload,
  ): Promise<GetAttendanceResponseDto> {
    return this.attendanceCheckService.getMyAttendance(user.id);
  }
}
