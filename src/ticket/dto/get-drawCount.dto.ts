import { ApiProperty } from '@nestjs/swagger';

export class GiftDrawCount {
  @ApiProperty({ description: '경품 고유 Id' })
  giftId: number;

  @ApiProperty({ description: '응모 횟수' })
  drawCount: number;
}

export class GetDrawCountDto {
  @ApiProperty({
    description: '전체 사용자의 응모 횟수',
    type: [GiftDrawCount],
  })
  allResult: GiftDrawCount[];

  @ApiProperty({
    description: '현재 사용자의 응모 횟수',
    type: [GiftDrawCount],
  })
  myResult: GiftDrawCount[];
}
