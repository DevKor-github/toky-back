import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class Question {
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

  @IsNumber()
  @ApiProperty({
    description: '실제 정답(답변 index)',
    type: Number,
    required: false,
  })
  realAnswer?: number;

  @IsString()
  @ApiProperty({
    description: '베팅 질문',
    type: String,
  })
  description: string;

  @IsArray()
  @ApiProperty({
    description: '베팅 질문 선택지',
    type: [String],
    example: ['고려대', '무승부', '연세대'],
  })
  choices: string[];

  @IsArray()
  @ApiProperty({
    description: 'percentage',
    type: [Number],
    example: [33, 33, 34],
  })
  percentage: number[];
}

export class betQuestionResponseDto {
  @ApiProperty({ description: '야구 질문 목록', type: Question })
  baseball: Question[];

  @ApiProperty({ description: '축구 질문 목록', type: Question })
  football: Question[];

  @ApiProperty({ description: '농구 질문 목록', type: Question })
  basketball: Question[];

  @ApiProperty({ description: '럭비 질문 목록', type: Question })
  rugby: Question[];

  @ApiProperty({ description: '빙구 질문 목록', type: Question })
  icehockey: Question[];
}
