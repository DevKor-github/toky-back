import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateBetAnswerDto {
  @IsNumber()
  @ApiProperty({
    description: '베팅 답변 id',
    type: Number,
  })
  answerId!: number;

  @IsNumber()
  @ApiProperty({
    description: '베팅 답변',
    type: Number,
  })
  answer!: number;
}
