import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: '수정할 이름' })
  @MaxLength(10, { message: '10자 이내로 입력해주세요' })
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^010\d{4}\d{4}$/, {
    message: '특수문자 없이 010으로 시작하는 11자리 전화번호를 입력해주세요.',
  })
  @ApiProperty({ description: '수정할 전화번호' })
  phoneNumber: string;
}
