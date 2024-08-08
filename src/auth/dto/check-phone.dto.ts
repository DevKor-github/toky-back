import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class CheckPhoneDto {
  @ApiProperty({ description: '전화번호' })
  @IsPhoneNumber('KR', { message: '올바른 전화번호를 입력해주세요.' })
  phoneNumber: string;
}
