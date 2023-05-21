/**
 * 
 *  clientID: config.naver.clientID,
        clientSecret: config.naver.clientSecret,
        callbackURL: config.naver.callbackURL
 */
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_REDIRECT_URL,
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
