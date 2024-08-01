import { ApiProperty } from '@nestjs/swagger';
import { University } from 'src/common/enums/university.enum';
import { UserEntity } from 'src/users/entities/user.entity';

export class ProfileDto {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  university: University;

  @ApiProperty()
  score: number;

  @ApiProperty()
  remain: number;

  @ApiProperty()
  phoneNumber?: string;

  constructor(user: UserEntity) {
    this.name = user.name;
    this.university = user.university;
    this.score = user.point.totalPoint;
    this.remain = user.point.remainingPoint;
    this.phoneNumber = user.phoneNumber;
  }
}
