import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttendanceCheckService } from './attendance-check.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceCheckQuizRequestDto } from './dto/attendance-check-quiz';

@ApiTags('attendance-check')
@Controller('attendance-check')
export class AttendanceCheckController {
  constructor(
    private readonly attendanceCheckService: AttendanceCheckService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '출석체크 퀴즈 제출' })
  async submitAttendanceCheckQuiz(
    @Req() req,
    @Body() attendanceCheckQuizRequestDto: AttendanceCheckQuizRequestDto,
  ) {
    return this.attendanceCheckService.submitAttendanceCheckQuiz(
      req.user.id,
      attendanceCheckQuizRequestDto,
    );
  }
}
