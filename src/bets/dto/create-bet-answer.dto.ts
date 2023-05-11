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
