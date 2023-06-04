import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/common/interfaces/JwtPayload';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';
import crypto from 'crypto-js';
import axios from 'axios';
import { PhoneEntity } from './entities/phone.entity';

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

  async checkRefreshToken(refreshToken: string, id: string) {
    const token = await this.tokenRepository.findOne({
      where: { id, refreshToken },
    });
    if (!token) {
      // TODO: throw error
      throw new Error('Invalid refresh token');
    }
    await this.tokenRepository.delete(token);
  }

  async validatePhoneNumber(phoneNumber: string, id: string) {
    const phone = await this.phoneRepository.findOne({
      where: { user: { id }, isValid: false },
      order: { createdAt: 'DESC' },
    });
    if (phone.createdAt.getTime() + 180000 > Date.now()) {
      // TODO: 에러
      throw new Error('이미 요청한 번호입니다.');
    }

    const API_URL = `https://sens.apigw.ntruss.com/sms/v2/services/${process.env.SENS_SERVICE_ID}/messages`;
    const rand = Math.floor(Math.random() * 1000000).toString();
    const number = rand.padStart(6, '0');
    const body = {
      type: 'SMS',
      from: process.env.SENS_PHONE_NUMBER,
      content: `[TOKY] 휴대폰 인증번호는 [${number}]입니다.`,
      messages: [
        {
          to: phoneNumber,
          content: `[TOKY] 휴대폰 인증번호는 [${number}]입니다.`,
        },
      ],
    };

    const phoneEntity = this.phoneRepository.create({
      user: { id },
      code: number,
      isValid: false,
    });
    await this.phoneRepository.save(phoneEntity);

    const accessKey = process.env.NAVER_API_KEY;
    const secretKey = process.env.NAVER_API_SECRET;
    const timestamp = Date.now().toString();
    const hmac = crypto.algo.HMAC.create(crypto.algo.SHA256, secretKey);
    hmac.update('POST');
    hmac.update(' ');
    hmac.update(`/services/${process.env.SENS_SERVICE_ID}/messages`);
    hmac.update('\n');
    hmac.update(`{${timestamp}}`);
    hmac.update('\n');
    hmac.update(`{${accessKey}}`);
    const hash = hmac.finalize();
    const signature = hash.toString(crypto.enc.Base64);

    const response = await axios.post(API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-signature-v2': signature,
      },
    });
    return Number(response.data.statusCode) == 202;
  }

  async checkCode(id: string, code: string) {
    const phone = await this.phoneRepository.findOne({
      where: { user: { id }, code },
    });

    if (phone.createdAt.getTime() + 180000 < Date.now()) {
      // TODO: 에러
      throw new Error('유효 시간이 지났습니다.');
    }
    if (phone.isValid) {
      // TODO: 에러
      throw new Error('이미 인증된 번호입니다.');
    }
    if (phone.code !== code) {
      // TODO: 에러
      throw new Error('인증번호가 일치하지 않습니다.');
    }
    phone.isValid = true;
    await this.phoneRepository.save(phone);
    return true;
  }
}
