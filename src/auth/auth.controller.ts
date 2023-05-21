import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    this.usersService = usersService;
    this.authService = authService;
  }

  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    // redirect to kakao login page
  }

  @Get('/kakao/redirect')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginRedirect(@Req() req, @Res() res) {
    const userInfoDto = await this.usersService.findOrCreateById(req.user.id);

    if (!userInfoDto.payload.phoneNumber) {
      res.redirect(process.env.DOMAIN + '/signup');
      return;
    }

    const token = await this.authService.getToken(userInfoDto.payload);

    res.cookie('access-token', token.accessToken);
    res.cookie('refresh-token', token.refreshToken);

    await this.authService.saveRefreshToken(
      token.refreshToken,
      userInfoDto.payload.id,
    );
    res.redirect(process.env.DOMAIN);
  }

  @Get('/naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin() {
    // redirect to naver login page
  }

  @Get('/naver/redirect')
  @UseGuards(AuthGuard('naver'))
  async naverLoginRedirect(@Req() req, @Res() res) {
    const userInfoDto = await this.usersService.findOrCreateById(req.user.id);

    if (!userInfoDto.payload.phoneNumber) {
      res.redirect(process.env.DOMAIN + '/signup');
      return;
    }

    const token = await this.authService.getToken(userInfoDto.payload);

    res.cookie('access-token', token.accessToken);
    res.cookie('refresh-token', token.refreshToken);

    await this.authService.saveRefreshToken(
      token.refreshToken,
      userInfoDto.payload.id,
    );
    res.redirect(process.env.DOMAIN);
  }
}
