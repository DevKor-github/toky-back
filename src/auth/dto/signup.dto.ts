import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { University } from 'src/common/enums/university.enum';

export class SignupDto {
  @ApiProperty({ description: '전화번호' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^010\d{4}\d{4}$/, {
    message: '특수문자 없이 010으로 시작하는 11자리 전화번호를 입력해주세요.',
  })
  phoneNumber: string;

  @ApiProperty({ description: '유저 이름' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10, { message: '10자 이내로 입력해주세요' })
  name: string;

  @ApiProperty({ description: '대학교' })
  @IsNotEmpty()
  @IsEnum(University)
  university: University;

  @ApiProperty({ description: '친구 초대 코드' })
  @IsOptional()
  @IsString()
  inviteCode: string;
}
