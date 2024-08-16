import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { RefreshTokenPayload } from '../interfaces/auth.interface';

export const RefreshUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RefreshTokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) throw new UnauthorizedException();
    return request.user;
  },
);
