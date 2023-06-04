import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from 'src/common/interfaces/JwtPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET_KEY,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<any> {
    const refreshToken = req.get('authorization').split('Bearer ')[1];

    return {
      ...payload,
      refreshToken,
    };
  }
}
