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
    description: '당일 날짜',
  })
  attendanceDate: string;

  @ApiProperty({
    description: '정답 여부',
  })
  correct: boolean;

  @ApiProperty({
    description: '정답에 대한 해설',
  })
  explanation: string;

  constructor(attendanceDate: string, correct: boolean, explanation: string) {
    this.attendanceDate = attendanceDate;
    this.correct = correct;
    this.explanation = explanation;
  }
}
