import { ApiProperty } from '@nestjs/swagger';
import { AttendanceCheckEntity } from '../entities/attendance-check.entity';

export class GetMyAttendanceResponseDto {
  @ApiProperty({ description: '출석한 날짜' })
  attendanceDate: string;

  @ApiProperty({ description: '출석한 날짜 정답 여부' })
  isAnswerCorrect: boolean;

  constructor(attendance: AttendanceCheckEntity) {
    this.attendanceDate = attendance.attendanceDate;
    this.isAnswerCorrect = attendance.isAnswerCorrect;
  }
}

export class GetAttendanceCheckQuizAndMyAttendanceResponseDto {
  @ApiProperty({
    description: '출석한 날짜 & 출석한 날짜의 정답 여부',
    type: [GetMyAttendanceResponseDto],
  })
  attendanceHistory: GetMyAttendanceResponseDto[];

  @ApiProperty({ description: '오늘 날짜 (YYYY-MM-DD 형식)' })
  today: string;

  @ApiProperty({ description: '출석체크 퀴즈 ID' })
  quizId: number;

  @ApiProperty({ description: '출석체크 퀴즈 질문' })
  question: string;

  constructor(
    attendanceHistory: GetMyAttendanceResponseDto[],
    today: string,
    quizId: number,
    question: string,
  ) {
    this.attendanceHistory = attendanceHistory;
    this.today = today;
    this.quizId = quizId;
    this.question = question;
  }
}
