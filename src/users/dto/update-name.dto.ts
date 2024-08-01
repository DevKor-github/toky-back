import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateNameDto {
  @IsString()
  @ApiProperty({ description: '수정할 이름' })
  name: string;
}
