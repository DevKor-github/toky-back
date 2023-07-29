import { IsEnum, IsPhoneNumber, IsString } from 'class-validator';
import { University } from 'src/common/enums/university.enum';

export class SignupDto {
  @IsPhoneNumber('KR', { message: '올바른 전화번호를 입력해주세요.' })
  phoneNumber: string;

  @IsString()
  name: string;

  @IsEnum(University)
  university: University;

  @IsString()
  code: string;
}
