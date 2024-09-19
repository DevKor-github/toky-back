import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { GetRankDto } from './get-rank.dto';

export class RankPageOptionsDto {
  @ApiProperty({
    description: '한 페이지에 담을 데이터 수, default = 10',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  take?: number = 10;

  @ApiProperty({
    description:
      '커서 값, (5자리 숫자)-(5자리 숫자) 형태의 문자열, 없으면 첫페이지',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export class CursorPageMetaData {
  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNextData: boolean;

  @ApiProperty({
    description: '다음페이지 조회용 커서, 다음페이지 없으면 null',
  })
  nextCursor: string;
}

export class RankPageResponseDto {
  @ApiProperty({
    description: '데이터 목록',
    type: [GetRankDto],
  })
  data: GetRankDto[];

  @ApiProperty({ description: '페이징 관련 메타데이터' })
  meta: CursorPageMetaData;
}
