import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CheckPhoneDto {
  @ApiProperty({ description: '전화번호' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '010-XXXX-XXXX 형식으로 입력해주세요.',
  })
  phoneNumber: string;
}
