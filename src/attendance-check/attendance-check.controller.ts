import {
  Body,
  Controller,
  Get,
  Post,
  Req,
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
import { GetAttendanceCheckQuizAndMyAttendanceResponseDto } from './dto/get-attendance-check-quiz-and-my-attendance.dto';

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

  @Get()
  @ApiOperation({
    summary: '오늘의 출석체크 퀴즈 보기 & 나의 출석체크 현황 보기',
  })
  @ApiResponse({
    status: 200,
    description:
      '오늘의 출석체크 퀴즈 조회 성공 & 나의 출석체크 현황 조회 성공',
    type: GetAttendanceCheckQuizAndMyAttendanceResponseDto,
  })
  async getAttendanceCheckQuizAndMyAttendance(
    @Req() req,
  ): Promise<GetAttendanceCheckQuizAndMyAttendanceResponseDto> {
    return this.attendanceCheckService.getAttendanceCheckQuizAndMyAttendance(
      req.user.id,
    );
  }
}
