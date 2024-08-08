import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNameDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '수정할 이름' })
  name: string;
}
