import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckNameDto {
  @ApiProperty({ description: '유저 이름' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10, { message: '10자 이내로 입력해주세요' })
  name: string;
}
