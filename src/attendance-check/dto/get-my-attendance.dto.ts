import { ApiProperty } from '@nestjs/swagger';
import { AttendanceCheckEntity } from '../entities/attendance-check.entity';

export class GetMyAttendanceResponseDto {
  @ApiProperty({ description: '출석한 날짜' })
  attendanceDate: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '출석한 날짜 정답 여부' })
  isAnswerCorrect: boolean;

  constructor(attendance: AttendanceCheckEntity) {
    this.attendanceDate = attendance.attendanceDate;
    this.userId = attendance.user.id;
    this.isAnswerCorrect = attendance.isAnswerCorrect;
  }
}
