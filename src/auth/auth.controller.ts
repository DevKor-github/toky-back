import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { PhoneDto } from './dto/phone.dto';
import {
  JwtPayload,
  RefreshTokenPayload,
} from 'src/common/interfaces/auth.interface';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefreshUser } from 'src/common/decorators/refreshUser.decorator';
import { AccessUser } from 'src/common/decorators/accessUser.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: '카카오 로그인' })
  async kakaoLogin() {
    // redirect to kakao login page
  }

  @Get('/kakao/redirect')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: '카카오 로그인 후 redirect 되는 url' })
  async kakaoLoginRedirect(@Req() req, @Res() res: Response) {
    const userInfoDto = await this.usersService.findOrCreateById(req.user.id);

    const token = await this.authService.getToken(userInfoDto.payload);
    res.cookie('access-token', token.accessToken, {
      expires: new Date(Date.now() + 60000 + 9 * 60 * 60 * 1000),
      sameSite: 'none',
      secure: true,
      httpOnly: false,
      domain: 'toky.devkor.club',
    });
    res.cookie('refresh-token', token.refreshToken, {
      expires: new Date(Date.now() + 60000 + 9 * 60 * 60 * 1000),
      sameSite: 'none',
      secure: true,
      httpOnly: false,
      domain: 'toky.devkor.club',
    });
    await this.authService.saveRefreshToken(
      token.refreshToken,
      userInfoDto.payload.id,
    );
    if (!userInfoDto.hasPhone) {
      res.redirect(process.env.DOMAIN + '/signup');
      return;
    }

    res.redirect(process.env.DOMAIN + '/bets');
  }
  @Post('/refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: 'Token 재발급' })
  async refresh(
    @RefreshUser() user: RefreshTokenPayload,
    @Res() res: Response,
  ) {
    try {
      const { refreshToken, id } = user;
      await this.authService.checkRefreshToken(refreshToken, id);
      const payload: JwtPayload = { id, signedAt: new Date().toISOString() };
      const token = await this.authService.getToken(payload);
      await this.authService.saveRefreshToken(token.refreshToken, id);

      res.json({
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      });
    } catch (err) {
      res.sendStatus(401);
    }
  }

  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '로그아웃' })
  async logout(@AccessUser() user: JwtPayload) {
    await this.authService.removeRefreshToken(user.id);
  }

  @Post('/signup')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '인증번호 확인 및 회원가입' })
  async signup(
    @AccessUser() user: JwtPayload,
    @Res() res: Response,
    @Body() signupDto: SignupDto,
  ) {
    try {
      console.log(signupDto);
      const isValidCode = await this.authService.checkCode(
        user.id,
        signupDto.code,
      );
      if (!isValidCode) throw Error('인증번호가 일치하지 않습니다.');

      await this.usersService.signup(signupDto, user.id);

      res.sendStatus(201);
    } catch (err) {
      console.log(err.message);
      res.status(400).json({ message: err.message });
    }
  }

  @Post('/phone')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '휴대폰 인증번호 발송' })
  async phone(
    @AccessUser() user: JwtPayload,
    @Res() res: Response,
    @Body() phoneDto: PhoneDto,
  ) {
    try {
      const { phoneNumber } = phoneDto;
      const dashRemovedPhoneNumber = phoneNumber.replace(/-/g, '');
      const isPhoneValid = await this.usersService.isValidPhoneNumber(
        dashRemovedPhoneNumber,
      );
      if (!isPhoneValid) {
        throw Error('이미 사용중인 휴대폰 번호입니다.');
      }

      await this.authService.validatePhoneNumber(
        dashRemovedPhoneNumber,
        user.id,
      );
      res.sendStatus(200);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  @Get('/checkname')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'name 중복확인' })
  async checkname(@Query('name') name: string) {
    return await this.usersService.isValidName(name);
  }

  @Get('/needsignup')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '회원가입이 필요한 유저인지 확인' })
  async checkSignupNeeded(@AccessUser() user: JwtPayload) {
    return await this.usersService.validateUser(user.id);
  }
}
