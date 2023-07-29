import { IsPhoneNumber } from 'class-validator';

export class PhoneDto {
  @IsPhoneNumber('KR', { message: '올바른 전화번호를 입력해주세요.' })
  phoneNumber: string;
}
