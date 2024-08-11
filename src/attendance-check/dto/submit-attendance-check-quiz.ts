import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitAttendanceCheckQuizRequestDto {
  @ApiProperty({
    description: '제출한 답',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SubmitAttendanceCheckQuizResponseDto {
  @ApiProperty({
    description: '유저 ID',
  })
  userId: string;

  @ApiProperty({
    description: '당일 날짜',
  })
  attendanceDate: string;

  @ApiProperty({
    description: '정답 여부',
  })
  correct: boolean;

  constructor(userId: string, attendanceDate: string, correct: boolean) {
    this.userId = userId;
    this.attendanceDate = attendanceDate;
    this.correct = correct;
  }
}
