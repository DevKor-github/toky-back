import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AttendanceCheckQuizRequestDto {
  @ApiProperty({
    description: '당일 날짜 (YYYY-MM-DD)',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM-DD',
  })
  @IsDate()
  @IsNotEmpty()
  attendanceDate: string;

  @ApiProperty({
    description: '제출한 답',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class AttendanceCheckQuizResponseDto {
  @ApiProperty({
    description: '당일 날짜',
  })
  date: string;

  @ApiProperty({
    description: '정답 여부',
  })
  correct: boolean;
}
