import { ApiProperty } from '@nestjs/swagger';
import { University } from 'src/common/enums/university.enum';
import { UserEntity } from 'src/users/entities/user.entity';

export class ProfileDto {
  @ApiProperty({ description: '유저 이름' })
  name: string;

  @ApiProperty({ type: 'enum', enum: University, description: '대학교' })
  university: University;

  @ApiProperty({ description: '응모권 개수' })
  ticket: number;

  @ApiProperty({ description: '전화번호' })
  phoneNumber: string;

  @ApiProperty({ description: '친구 초대 코드' })
  inviteCode: string;

  constructor(user: UserEntity) {
    this.name = user.name;
    this.university = user.university;
    this.ticket = user.ticket.count;
    this.phoneNumber = user.phoneNumber;
    this.inviteCode = user.inviteCode;
  }
}
