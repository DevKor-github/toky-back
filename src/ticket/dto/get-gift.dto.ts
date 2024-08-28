import { ApiProperty } from '@nestjs/swagger';

export class GetGiftDto {
  @ApiProperty({ description: '경품 고유 Id' })
  id: number;

  @ApiProperty({ description: '경품 이름' })
  name: string;

  @ApiProperty({ description: '응모에 필요한 응모권 수(전부다 1)' })
  requiredTicket: number;

  @ApiProperty({ description: '경품 이미지 url' })
  photoUrl: string;

  @ApiProperty({ description: '전체 응모 수' })
  count: number;
}
