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
    description: '베팅 답변',
    type: Number,
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
    type: Array<string>,
  })
  choices: string[];

  @IsArray()
  @ApiProperty({
    description: 'percentage',
    type: Array<number>,
  })
  percentage: number[];
}
