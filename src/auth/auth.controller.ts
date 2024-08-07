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
import { TokenResponseDto } from './dto/token.dto';

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
  ): Promise<TokenResponseDto> {
    return await this.authService.refreshToken(user);
  }

  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '로그아웃' })
  async logout(@AccessUser() user: JwtPayload): Promise<void> {
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
      await this.usersService.signup(signupDto, user.id);
      res.sendStatus(201);
    } catch (err) {
      console.log(err.message);
      res.status(400).json({ message: err.message });
    }
  }

  @Get('/check-phone-number')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'phoneNumber 중복 / 형식 확인' })
  async checkPhoneNumber(@Body() phoneDto: PhoneDto): Promise<boolean> {
    return await this.usersService.isValidPhoneNumber(phoneDto.phoneNumber);
  }

  @Get('/check-name')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'name 중복확인' })
  async checkname(@Query('name') name: string) {
    return await this.usersService.isValidName(name);
  }

  @Get('/need-signup')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '회원가입이 필요한 유저인지 확인' })
  async checkSignupNeeded(@AccessUser() user: JwtPayload) {
    return await this.usersService.validateUser(user.id);
  }
}
