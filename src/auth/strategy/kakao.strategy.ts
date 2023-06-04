import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: process.env.KAKAO_REDIRECT_URL,
    });
  }

  async validate(_: string, __: string, profile: Profile) {
    const { id } = profile;

    const user = {
      id,
    };
    return user;
  }
}
