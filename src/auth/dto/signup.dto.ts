import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
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
  name: string;

  @ApiProperty({ description: '대학교' })
  @IsNotEmpty()
  @IsEnum(University)
  university: University;
}
