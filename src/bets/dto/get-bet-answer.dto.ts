import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class Answer {
  @IsNumber()
  @ApiProperty({
    description: '베팅 질문 id',
    type: Number,
  })
  questionId!: number;

  @IsNumber()
  @ApiProperty({
    description: '유저가 베팅한 답변(답변 index)',
    type: Number,
    required: false,
  })
  myAnswer?: number;
}

export class betAnswerResponseDto {
  @ApiProperty({ description: '야구 질문 목록', type: [Answer] })
  baseball: Answer[];

  @ApiProperty({ description: '축구 질문 목록', type: [Answer] })
  football: Answer[];

  @ApiProperty({ description: '농구 질문 목록', type: [Answer] })
  basketball: Answer[];

  @ApiProperty({ description: '럭비 질문 목록', type: [Answer] })
  rugby: Answer[];

  @ApiProperty({ description: '빙구 질문 목록', type: [Answer] })
  icehockey: Answer[];
}
