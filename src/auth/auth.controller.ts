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
import { CheckPhoneDto } from './dto/check-phone.dto';
import {
  JwtPayload,
  RefreshTokenPayload,
} from 'src/common/interfaces/auth.interface';
import { Response } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefreshUser } from 'src/common/decorators/refreshUser.decorator';
import { AccessUser } from 'src/common/decorators/accessUser.decorator';
import { TokenResponseDto } from './dto/token.dto';
import { CheckNameDto } from './dto/check-name.dto';

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
  async kakaoLogin(): Promise<void> {
    // redirect to kakao login page
  }

  @Get('/kakao/redirect')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: '카카오 로그인 후 redirect 되는 url' })
  async kakaoLoginRedirect(@Req() req, @Res() res: Response): Promise<void> {
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
  @ApiResponse({
    status: 201,
    description: 'Token 재발급 성공 시',
    type: TokenResponseDto,
  })
  async refresh(
    @RefreshUser() user: RefreshTokenPayload,
  ): Promise<TokenResponseDto> {
    return await this.authService.refreshToken(user);
  }

  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 201, description: '로그아웃 성공 시' })
  async logout(@AccessUser() user: JwtPayload): Promise<void> {
    await this.authService.removeRefreshToken(user.id);
  }

  @Post('/signup')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공 시',
  })
  @ApiResponse({
    status: 400,
    description: '회원가입 실패 시',
  })
  async signup(
    @AccessUser() user: JwtPayload,
    @Res() res: Response,
    @Body() signupDto: SignupDto,
  ): Promise<void> {
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
  @ApiQuery({ name: 'phoneNumber', description: '전화번호' })
  @ApiResponse({
    status: 200,
    description: '중복 / 형식 이상 없을 시 true',
    type: Boolean,
  })
  async checkPhoneNumber(
    @Query() checkPhoneDto: CheckPhoneDto,
  ): Promise<boolean> {
    return await this.usersService.isValidPhoneNumber(
      checkPhoneDto.phoneNumber,
    );
  }

  @Get('/check-name')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'name 중복확인' })
  @ApiQuery({ name: 'name', description: '유저 이름' })
  @ApiResponse({
    status: 200,
    description: '중복 X 확인 완료 시 true',
    type: Boolean,
  })
  async checkname(@Query() checkNameDto: CheckNameDto): Promise<boolean> {
    return await this.usersService.isValidName(checkNameDto.name);
  }

  @Get('/need-signup')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '회원가입이 필요한 유저인지 확인' })
  @ApiResponse({
    status: 200,
    description: '회원가입 이미 했을 시 true',
    type: Boolean,
  })
  async checkSignupNeeded(@AccessUser() user: JwtPayload): Promise<boolean> {
    return await this.usersService.validateUser(user.id);
  }
}
