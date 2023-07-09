import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerResDto {
  @ApiProperty({
    description: 'answer id',
    type: Number,
  })
  answerId!: number;
}
