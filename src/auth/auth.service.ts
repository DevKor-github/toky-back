/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  JwtPayload,
  RefreshTokenPayload,
} from 'src/common/interfaces/auth.interface';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';
import { TokenResponseDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
  ) {}

  async getToken(payload: JwtPayload): Promise<TokenResponseDto> {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET_KEY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET_KEY,
    });

    return new TokenResponseDto(accessToken, refreshToken);
  }

  async refreshToken(payload: RefreshTokenPayload): Promise<TokenResponseDto> {
    const { refreshToken, id } = payload;
    const existingToken = await this.tokenRepository.find({
      where: { user: { id }, refreshToken },
    });
    if (!existingToken) {
      // TODO : throw error
      throw new Error('Invalid refresh token - id error');
    }

    const newPayload: JwtPayload = { id, signedAt: new Date().toISOString() };
    const token = await this.getToken(newPayload);
    const updated = await this.tokenRepository.update(
      {
        user: { id },
      },
      { refreshToken: token.refreshToken },
    );

    if (updated.affected === 0) {
      throw new InternalServerErrorException('refreshToken update failed!');
    }

    return token;
  }

  async saveRefreshToken(refreshToken: string, id: string): Promise<void> {
    const token = this.tokenRepository.create({
      refreshToken,
      user: { id },
    });
    await this.tokenRepository.save(token);
    console.log('saved');
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.tokenRepository.delete({ user: { id: id } });
  }
}
