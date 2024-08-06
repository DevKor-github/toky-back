import {
  Body,
  Controller,
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
}
