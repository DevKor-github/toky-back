import { JwtPayload } from 'src/common/interfaces/JwtPayload';
import { UserEntity } from '../entities/user.entity';

export class UserInfoDto {
  constructor(user: UserEntity) {
    this.payload = {
      id: user.id,
      signedAt: new Date().toISOString(),
    };
    this.hasPhone = user.phoneNumber ? true : false;
  }
  hasPhone: boolean;
  payload: JwtPayload;
}
