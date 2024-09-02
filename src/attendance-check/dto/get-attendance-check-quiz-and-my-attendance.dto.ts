import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiProperty({ description: '오늘 출석 여부' })
  todayAttendance: boolean;

  @ApiProperty({ description: '(출석 했을 시) 나의 정답 여부' })
  isMyAnswerCorrect: boolean;

  @ApiProperty({ description: '(출석 했을 시) 오늘자 정답' })
  todayAnswer: boolean;

  constructor(
    attendanceHistory: GetMyAttendanceResponseDto[],
    today: string,
    quizId: number | null,
    question: string | null,
    todayAttendance: boolean,
    isMyAnswerCorrect: boolean | null,
    todayAnswer: boolean | null,
  ) {
    this.attendanceHistory = attendanceHistory;
    this.today = today;
    this.quizId = quizId;
    this.question = question;
    this.todayAttendance = todayAttendance;
    this.isMyAnswerCorrect = isMyAnswerCorrect;
    this.todayAnswer = todayAnswer;
  }
}
