/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/common/interfaces/JwtPayload';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';

import axios from 'axios';
import { PhoneEntity } from './entities/phone.entity';

const crypto = require('crypto');

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    @InjectRepository(PhoneEntity)
    private readonly phoneRepository: Repository<PhoneEntity>,
  ) {
    this.tokenRepository = tokenRepository;
    this.phoneRepository = phoneRepository;
    this.jwtService = jwtService;
  }

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
    const token = await this.tokenRepository.create({
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

  async validatePhoneNumber(phoneNumber: string, id: string) {
    const phone = await this.phoneRepository.findOne({
      where: { user: { id }, isValid: false },
      order: { createdAt: 'DESC' },
    });
    if (
      phone &&
      phone.createdAt.getTime() + 180000 > Date.now() - 1000 * 60 * 60 * 9 // 1000 * 60 * 60 * 9 : 시차데스 ..
    ) {
      // TODO: 에러
      throw new Error('잠시 후에 다시 인증번호를 요청해주세요.');
    }

    const API_URL = `https://api.coolsms.co.kr/messages/v4/send-many/detail`;
    const rand = Math.floor(Math.random() * 1000000).toString();
    const number = rand.padStart(6, '0');
    const body = {
      messages: [
        {
          from: process.env.COOLSMS_PHONE_NUMBER,
          to: phoneNumber,
          text: `[TOKY] 휴대폰 인증번호는 [${number}]입니다.`,
          type: 'SMS',
        },
      ],
    };

    const phoneEntity = this.phoneRepository.create({
      user: { id },
      code: number,
      isValid: false,
    });
    await this.phoneRepository.save(phoneEntity);

    const accessKey = process.env.COOLSMS_API_KEY;
    const secretKey = process.env.COOLSMS_API_SECRET;
    const timestamp = new Date().toISOString();
    const salt = crypto.randomBytes(32).toString('hex');

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(`${timestamp}${salt}`);
    const hash = hmac.digest('hex');

    const authHeader = `HMAC-SHA256 apiKey=${accessKey}, date=${timestamp}, salt=${salt}, signature=${hash}`;

    const response = await axios.post(API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    if (response.data.failedMessageList.length !== 0)
      throw new Error('올바르지 않은 전화번호입니다. 다시 시도해주세요.');
  }

  async checkCode(id: string, code: string) {
    const phone = await this.phoneRepository.findOne({
      where: { user: { id }, code },
    });
    if (!phone) {
      throw new Error('인증번호가 일치하지 않습니다.');
    }
    if (phone.createdAt.getTime() + 180000 < Date.now() - 1000 * 60 * 60 * 9) {
      // TODO: 에러
      throw new Error('유효 시간이 지났습니다. 인증번호를 다시 요청해주세요.');
    }

    if (phone.isValid) {
      // TODO: 에러
      throw new Error('이미 인증된 번호입니다.');
    }

    phone.isValid = true;
    await this.phoneRepository.save(phone);
    return true;
  }
}
