import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

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

    const token = await this.authService.getToken(userInfoDto.payload);
    res.cookie('access-token', token.accessToken);
    res.cookie('refresh-token', token.refreshToken);

    if (!userInfoDto.payload.phoneNumber) {
      res.redirect(process.env.DOMAIN + '/signup');
      return;
    }

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

    const token = await this.authService.getToken(userInfoDto.payload);
    res.cookie('access-token', token.accessToken);
    res.cookie('refresh-token', token.refreshToken);

    if (!userInfoDto.payload.phoneNumber) {
      res.redirect(process.env.DOMAIN + '/signup');
      return;
    }

    await this.authService.saveRefreshToken(
      token.refreshToken,
      userInfoDto.payload.id,
    );
    res.redirect(process.env.DOMAIN);
  }

  @Post('/refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req, @Res() res) {
    const { refreshToken, id, phoneNumber } = req.user;
    await this.authService.checkRefreshToken(refreshToken, id);
    const payload = { id, phoneNumber };
    const token = await this.authService.getToken(payload);
    res.cookie('access-token', token.accessToken);
    res.cookie('refresh-token', token.refreshToken);

    await this.authService.saveRefreshToken(token.refreshToken, id);
    res.redirect(process.env.DOMAIN);
  }

  @Get('/logout')
  @UseGuards(AuthGuard('jwt-refresh'))
  async logout(@Req() req, @Res() res) {
    res.clearCookie('access-token');
    res.clearCookie('refresh-token');

    const { refreshToken, id } = req.user;
    await this.authService.checkRefreshToken(refreshToken, id);

    res.redirect(process.env.DOMAIN);
  }

  @Post('/signup')
  @UseGuards(AuthGuard('jwt'))
  async signup(@Req() req, @Res() res, @Body() signupDto: SignupDto) {
    const { id, phoneNumber } = req.user;

    await this.usersService.signup(signupDto, id);

    const payload = { id, phoneNumber };
    const token = await this.authService.getToken(payload);
    res.cookie('access-token', token.accessToken);
    res.cookie('refresh-token', token.refreshToken);

    await this.authService.saveRefreshToken(token.refreshToken, id);

    res.redirect(process.env.DOMAIN);
  }
}
