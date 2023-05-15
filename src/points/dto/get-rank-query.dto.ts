import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { Match } from 'src/common/enums/event.enum';

export class GetRankingQueryDto {
  @Transform(({ value }) => (value !== '' ? Number(value) : undefined))
  @IsOptional()
  @IsEnum(Match)
  @ApiProperty({
    description: '경기 항목',
    type: 'enum',
    enum: Match,
  })
  match?: Match;
}
