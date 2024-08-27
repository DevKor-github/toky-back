import { ApiProperty } from '@nestjs/swagger';
import { DrawGiftDto } from './draw-gift.dto';

export class GetDrawCountDto {
  @ApiProperty({
    description: '전체 사용자의 응모 횟수',
    type: [DrawGiftDto],
  })
  allResult: DrawGiftDto[];

  @ApiProperty({
    description: '현재 사용자의 응모 횟수',
    type: [DrawGiftDto],
  })
  myResult: DrawGiftDto[];
}
