import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { University } from 'src/common/enums/university.enum';

export class CheerDto {
  @IsEnum(University)
  @ApiProperty({
    description: '대학교',
    type: University,
  })
  univ: University;
}
