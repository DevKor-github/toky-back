import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SubmitAttendanceCheckQuizRequestDto {
  @ApiProperty({
    description: '제출한 답',
  })
  @IsBoolean()
  @IsNotEmpty()
  answer: boolean;
}

export class SubmitAttendanceCheckQuizResponseDto {
  @ApiProperty({
    description: '당일 날짜',
  })
  attendanceDate: string;

  @ApiProperty({
    description: '정답 여부',
  })
  correct: boolean;

  constructor(attendanceDate: string, correct: boolean) {
    this.attendanceDate = attendanceDate;
    this.correct = correct;
  }
}
