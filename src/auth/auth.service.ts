/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/common/interfaces/auth.interface';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
  ) {}

  async getToken(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET_KEY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET_KEY,
    });

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(refreshToken: string, id: string) {
    const existingTokens = await this.tokenRepository.find({
      where: { user: { id } },
    });
    this.tokenRepository.remove(existingTokens);
    const token = this.tokenRepository.create({
      refreshToken,
      user: { id },
    });
    await this.tokenRepository.save(token);
    console.log('saved');
  }

  async checkRefreshToken(refreshToken: string, id: string) {
    const token = await this.tokenRepository.findOne({
      where: { user: { id }, refreshToken },
    });
    if (!token) {
      // TODO: throw error
      throw new Error('Invalid refresh token - id error');
    }
  }

  async removeRefreshToken(id: string) {
    await this.tokenRepository.delete({ user: { id: id } });
  }
}
