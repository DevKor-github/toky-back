import { JwtPayload } from 'src/common/interfaces/auth.interface';
import { UserEntity } from '../entities/user.entity';

export class UserInfoDto {
  hasPhone: boolean;
  payload: JwtPayload;

  constructor(user: UserEntity) {
    this.payload = {
      id: user.id,
      signedAt: new Date().toISOString(),
    };
    this.hasPhone = user.phoneNumber ? true : false;
  }
}
