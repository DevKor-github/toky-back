import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Match } from 'src/common/enums/event.enum';

export class InputAnswerDto {
  @ApiProperty({ description: '정답을 입력할 경기', enum: Match })
  @IsNotEmpty()
  @IsEnum(Match)
  match: Match;

  @ApiProperty({
    description: '정답(index) 목록',
    example: [1, 0, 2, 1, 0],
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(5)
  @ArrayMinSize(5)
  answers: number[];

  @ApiProperty({ description: 'admin code' })
  @IsNotEmpty()
  @IsString()
  adminCode: string;
}
