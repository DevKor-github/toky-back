import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { NaverStrategy } from './strategy/naver.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtStrategy as RefreshStrategy } from './strategy/refreshToken.strategy';
import { UsersService } from 'src/users/users.service';
import { TokenEntity } from './entities/token.entity';
import { PhoneEntity } from './entities/phone.entity';
import { PointEntity } from 'src/points/entities/point.entity';
import { HistoryEntity } from 'src/points/entities/history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TokenEntity,
      PointEntity,
      HistoryEntity,
      PhoneEntity,
    ]),
    JwtModule.register({}),
  ],
  providers: [
    AuthService,
    UsersService,
    KakaoStrategy,
    NaverStrategy,
    JwtStrategy,
    RefreshStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
