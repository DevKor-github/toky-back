import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtStrategy as RefreshStrategy } from './strategy/refreshToken.strategy';
import { TokenEntity } from './entities/token.entity';
import { PhoneEntity } from './entities/phone.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, TokenEntity, PhoneEntity]),
    JwtModule.register({}),
    UsersModule,
  ],
  providers: [AuthService, KakaoStrategy, JwtStrategy, RefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
