import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AttendanceCheckService } from './attendance-check.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
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
} from './dto/submit-attendance-check-quiz';
import { GetAttendanceCheckQuizResponseDto } from './dto/get-attendance-check-quiz.dto';
import { GetMyAttendanceResponseDto } from './dto/get-my-attendance.dto';

@ApiTags('attendance-check')
@ApiBearerAuth('accessToken')
@Controller('attendance-check')
@UseGuards(AuthGuard('jwt'))
export class AttendanceCheckController {
  constructor(
    private readonly attendanceCheckService: AttendanceCheckService,
  ) {}

  @Post()
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
    @Req() req,
    @Body()
    submitAttendanceCheckQuizRequestDto: SubmitAttendanceCheckQuizRequestDto,
  ): Promise<SubmitAttendanceCheckQuizResponseDto> {
    return this.attendanceCheckService.submitAttendanceCheckQuiz(
      transactionManager,
      req.user.id,
      submitAttendanceCheckQuizRequestDto,
    );
  }

  @Get('my-attendance')
  @ApiOperation({ summary: '나의 출석체크 여부 조회' })
  @ApiResponse({
    status: 200,
    description: '나의 출석체크 여부 조회 성공',
    type: GetMyAttendanceResponseDto,
    isArray: true,
  })
  async getMyAttendance(@Req() req): Promise<GetMyAttendanceResponseDto[]> {
    return this.attendanceCheckService.getMyAttendance(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '오늘의 출석체크 퀴즈 보기' })
  @ApiQuery({
    name: 'today',
    description: '오늘 날짜(YYYY-MM-DD)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '오늘의 출석체크 퀴즈 조회 성공',
    type: GetAttendanceCheckQuizResponseDto,
  })
  async getAttendanceCheckQuiz(
    @Query('today') today: string,
  ): Promise<GetAttendanceCheckQuizResponseDto> {
    return this.attendanceCheckService.getAttendanceCheckQuiz(today);
  }
}
