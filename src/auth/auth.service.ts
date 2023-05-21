import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/common/interfaces/JwtPayload';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
  ) {
    this.tokenRepository = tokenRepository;
    this.jwtService = jwtService;
  }

  async getToken(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET_KEY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_SECRET_KEY,
    });

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(refreshToken: string, id: string) {
    const token = this.tokenRepository.create({ refreshToken, id });
    await this.tokenRepository.save(token);
  }
}
