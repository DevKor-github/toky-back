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

export class GetAttendanceResponseDto {
  @ApiProperty({
    description: '출석한 날짜 & 출석한 날짜의 정답 여부',
    type: [GetMyAttendanceResponseDto],
  })
  attendanceHistory: GetMyAttendanceResponseDto[];

  @ApiProperty({ description: '오늘 출석 여부' })
  todayAttendance: boolean;

  @ApiProperty({ description: '(출석 했을 시) 나의 정답 여부' })
  isMyAnswerCorrect: boolean;

  @ApiProperty({ description: '(출석 했을 시) 오늘자 정답' })
  todayAnswer: boolean;

  constructor(
    attendanceHistory: GetMyAttendanceResponseDto[],
    todayAttendance: boolean,
    isMyAnswerCorrect: boolean | null,
    todayAnswer: boolean | null,
  ) {
    this.attendanceHistory = attendanceHistory;
    this.todayAttendance = todayAttendance;
    this.isMyAnswerCorrect = isMyAnswerCorrect;
    this.todayAnswer = todayAnswer;
  }
}
