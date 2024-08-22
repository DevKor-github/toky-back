import { ApiProperty } from '@nestjs/swagger';

export class ToTalPredictionDto {
  @ApiProperty({ description: '고려대 승리 수' })
  numWinKorea: number;

  @ApiProperty({ description: '연세대 승리 수' })
  numWinYonsei: number;

  @ApiProperty({ description: '무승부 수' })
  numDraw: number;
}
