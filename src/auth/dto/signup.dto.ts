import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsPhoneNumber, IsString } from 'class-validator';
import { University } from 'src/common/enums/university.enum';

export class SignupDto {
  @ApiProperty({ description: '전화번호' })
  @IsPhoneNumber('KR', { message: '올바른 전화번호를 입력해주세요.' })
  phoneNumber: string;

  @ApiProperty({ description: '유저 이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '대학교' })
  @IsEnum(University)
  university: University;
}
