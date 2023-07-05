import { JwtPayload } from 'src/common/interfaces/JwtPayload';
import { UserEntity } from '../entities/user.entity';

export class UserInfoDto {
  constructor(user: UserEntity) {
    this.payload.id = user.id;
    this.payload.phoneNumber = user.phoneNumber;
  }

  payload: JwtPayload;
}
