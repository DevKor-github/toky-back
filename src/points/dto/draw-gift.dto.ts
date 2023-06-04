import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DrawGiftDto {
  @IsNumber()
  @ApiProperty({
    description: '경품 id',
    type: Number,
  })
  giftId!: number;
}
