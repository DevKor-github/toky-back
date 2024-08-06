import { ApiProperty } from '@nestjs/swagger';

export class GetAttendanceCheckQuizResponseDto {
  @ApiProperty({ description: '오늘 날짜 (YYYY-MM-DD 형식)' })
  today: string;

  @ApiProperty({ description: '출석체크 퀴즈 ID' })
  quizId: number;

  @ApiProperty({ description: '출석체크 퀴즈 질문' })
  question: string;

  constructor(today: string, quizId: number, question: string) {
    this.today = today;
    this.quizId = quizId;
    this.question = question;
  }
}
