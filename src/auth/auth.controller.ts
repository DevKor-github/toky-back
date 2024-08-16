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
import { JwtPayload } from 'src/common/interfaces/JwtPayload';
import { UpdateNameDto } from './dto/update-name.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@ApiBearerAuth('accessToken')
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
  async refresh(@Req() req, @Res() res) {
    try {
      const { refreshToken, id } = req.user;
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

  @Get('/logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req) {
    const { id } = req.user;
    await this.authService.removeRefreshToken(id);
  }

  @Post('/signup')
  @UseGuards(AuthGuard('jwt'))
  async signup(@Req() req, @Res() res, @Body() signupDto: SignupDto) {
    try {
      console.log(signupDto);
      const { id } = req.user;

      const isValidCode = await this.authService.checkCode(id, signupDto.code);
      if (!isValidCode) throw Error('인증번호가 일치하지 않습니다.');

      await this.usersService.signup(signupDto, id);

      res.sendStatus(201);
    } catch (err) {
      console.log(err.message);
      res.status(400).json({ message: err.message });
    }
  }

  @Post('/phone')
  @UseGuards(AuthGuard('jwt'))
  async phone(@Req() req, @Res() res, @Body() phoneDto: PhoneDto) {
    try {
      const { id } = req.user;
      const { phoneNumber } = phoneDto;
      const dashRemovedPhoneNumber = phoneNumber.replace(/-/g, '');
      const isPhoneValid = await this.usersService.isValidPhoneNumber(
        dashRemovedPhoneNumber,
      );
      if (!isPhoneValid) {
        throw Error('이미 사용중인 휴대폰 번호입니다.');
      }

      await this.authService.validatePhoneNumber(dashRemovedPhoneNumber, id);
      res.sendStatus(200);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  @Get('/checkname')
  @UseGuards(AuthGuard('jwt'))
  async checkname(@Query('name') name: string) {
    return await this.usersService.isValidName(name);
  }

  @Get('/needsignup')
  @UseGuards(AuthGuard('jwt'))
  async checkSignupNeeded(@Req() req) {
    const { id } = req.user;
    return await this.usersService.validateUser(id);
  }

  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  async getUserProfile(@Req() req) {
    const { id } = req.user;
    const user = await this.usersService.findUserById(id);

    return {
      name: user.name,
      university: user.university,
      ticket: user.ticket.count,
      phoneNumber: user.phoneNumber,
    };
  }

  @Post('/update/name')
  @UseGuards(AuthGuard('jwt'))
  async updateName(@Req() req, @Body() updateNameDto: UpdateNameDto) {
    const { id } = req.user;

    return this.usersService.updateName(id, updateNameDto.name);
  }
}
