import { ApiProperty } from '@nestjs/swagger';

export class CheerRateDto {
  @ApiProperty({
    description: '학교별 응원하는 인원 수, [고려대, 연세대]',
    type: [Number],
    example: [123, 111],
  })
  participants: number[];
}
