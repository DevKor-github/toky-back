import { ApiProperty } from '@nestjs/swagger';

export class GetHistoryDto {
  @ApiProperty({ description: '내역 고유 Id' })
  id: number;

  @ApiProperty({ description: '내역 세부 내용' })
  detail: string;

  @ApiProperty({ description: '사용/획득 한 응모권 수' })
  usedTicket: number;

  @ApiProperty({ description: '남은 응모권 수' })
  remainingTicket: number;

  @ApiProperty({ description: '사용/획득 시점' })
  createdAt: Date;
}
