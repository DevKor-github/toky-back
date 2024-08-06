import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateBetAnswerDto {
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
  answer!: number;
}

export class CreateBetAnswerResponseDto {
  @ApiProperty({
    description: '답변별 베팅한 사용자 비율',
    type: [Number],
    example: [33, 33, 34],
  })
  percentage: number[];
}
