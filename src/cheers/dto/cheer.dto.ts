import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { University } from 'src/common/enums/university.enum';

export class CheerDto {
  @ApiProperty({ description: '응원하는 학교', enum: University })
  @IsEnum(University)
  univ: University;
}
