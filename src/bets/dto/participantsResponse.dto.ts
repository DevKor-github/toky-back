import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ParticipantsResponseDto {
  @IsNumber()
  @ApiProperty({
    description: '고려대 참여 수',
    type: Number,
  })
  korea: number;

  @IsNumber()
  @ApiProperty({
    description: '연세대 참여 수',
    type: Number,
  })
  yonsei: number;
}
