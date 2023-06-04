import { IsPhoneNumber } from 'class-validator';

export class PhoneDto {
  @IsPhoneNumber()
  phoneNumber: string;
}
