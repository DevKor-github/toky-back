/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
      expiresIn: '3m',
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
    const existingToken = await this.tokenRepository.findOne({
      where: { user: { id }, refreshToken },
    });
    if (!existingToken) {
      throw new NotFoundException('Invalid refresh token - id error');
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
    const existingToken = await this.tokenRepository.findOne({
      where: { user: { id } },
    });
    if (existingToken) {
      existingToken.refreshToken = refreshToken;
      await this.tokenRepository.save(existingToken);
      console.log('updated');
    } else {
      const token = this.tokenRepository.create({
        refreshToken,
        user: { id },
      });
      await this.tokenRepository.save(token);
      console.log('saved');
    }
  }

  async removeRefreshToken(id: string): Promise<void> {
    const token = await this.tokenRepository.findOne({
      where: { user: { id } },
    });

    if (!token) {
      throw new NotFoundException('User not found!');
    }
    await this.tokenRepository.remove(token);
  }
}
