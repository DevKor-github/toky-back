import { ApiProperty } from '@nestjs/swagger';
import { University } from 'src/common/enums/university.enum';

export class GetRankDto {
  @ApiProperty({ description: '랭킹 등수' })
  rank: number;

  @ApiProperty({ description: '정답 맞힌 비율' })
  correctAnswerPercentage: number;

  @ApiProperty({ description: '유저 이름' })
  name: string;

  @ApiProperty({ description: '유저 학교(0: 고대, 1: 연대)', enum: University })
  university: University;
}
