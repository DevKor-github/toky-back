import { ApiProperty } from '@nestjs/swagger';
import { University } from 'src/common/enums/university.enum';

export class CheerRateDto {
  @ApiProperty({
    description: '응원하는 학교',
    enum: University,
    nullable: true,
  })
  cheering: University | null;

  @ApiProperty({
    description: '학교별 응원하는 인원 수, [고려대, 연세대]',
    type: [Number],
    example: [123, 111],
  })
  participants: number[];
}
