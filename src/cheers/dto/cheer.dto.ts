import { IsEnum } from 'class-validator';
import { University } from 'src/common/enums/university.enum';

export class CheerDto {
  @IsEnum(University)
  univ: University;
}
