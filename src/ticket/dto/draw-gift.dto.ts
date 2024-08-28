import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class DrawGiftDto {
  @IsNumber()
  @ApiProperty({
    description: '경품 id',
    type: Number,
  })
  giftId!: number;

  @IsNumber()
  @ApiProperty({
    description: '응모 횟수',
    type: Number,
  })
  count!: number;
}

export class DrawGiftListDto {
  @ApiProperty({
    description: '경품 별 응모 횟수',
    type: [DrawGiftDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DrawGiftDto)
  draws: DrawGiftDto[];
}
