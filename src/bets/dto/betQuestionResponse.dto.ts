import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class betQuestionResponseDto {
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
  answer?: number;

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
