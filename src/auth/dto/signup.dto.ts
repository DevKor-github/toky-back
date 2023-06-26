import { IsEnum, IsPhoneNumber, IsString } from 'class-validator';
import { University } from 'src/common/enums/university.enum';

export class SignupDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  name: string;

  @IsEnum(University)
  university: University;
}
