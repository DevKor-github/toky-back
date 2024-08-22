import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import {
  JwtPayload,
  RefreshTokenPayload,
} from 'src/common/interfaces/auth.interface';
import { Response } from 'express';
import {
  ApiBearerAuth,
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
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/common/decorators/manager.decorator';
import { EntityManager } from 'typeorm';

@ApiTags('auth')
@ApiBearerAuth('accessToken')
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
      httpOnly: true, // 클라이언트에서 쿠키에 접근하지 못하게 설정
      secure: false, // 개발 환경에서는 https가 아니더라도 쿠키 설정 허용
      sameSite: 'Lax', // 또는 'None' 설정으로 크로스 도메인 문제 해결
      // domain: 'dev.toky.devkor.club',
    });
    res.cookie('refresh-token', token.refreshToken, {
      expires: new Date(Date.now() + 60000 + 9 * 60 * 60 * 1000),
      httpOnly: true, // 클라이언트에서 쿠키에 접근하지 못하게 설정
      secure: false, // 개발 환경에서는 https가 아니더라도 쿠키 설정 허용
      sameSite: 'Lax', // 또는 'None' 설정으로 크로스 도메인 문제 해결
      // domain: 'dev.toky.devkor.club',
    });

    await this.authService.saveRefreshToken(
      token.refreshToken,
      userInfoDto.payload.id,
    );
    if (!userInfoDto.hasPhone) {
      res.redirect(process.env.DOMAIN + '/signup');
      return;
    }
    res.redirect(process.env.DOMAIN);
  }

  @Post('/refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({
    summary: 'Token 재발급',
    description:
      'refreshToken을 이용하여 accessToken, refreshToken을 재발급합니다.',
  })
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
  @ApiOperation({
    summary: '로그아웃',
    description: '서버에 저장된 refreshToken을 삭제합니다.',
  })
  @ApiResponse({ status: 201, description: '로그아웃 성공 시' })
  async logout(@AccessUser() user: JwtPayload): Promise<void> {
    await this.authService.removeRefreshToken(user.id);
  }

  @Post('/signup')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공 시',
  })
  async signup(
    @TransactionManager() transactionManager: EntityManager,
    @AccessUser() user: JwtPayload,
    @Body() signupDto: SignupDto,
  ): Promise<void> {
    console.log(signupDto);
    await this.usersService.signup(transactionManager, signupDto, user.id);
  }

  @Get('/check-name')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'name 중복확인',
    description: '유저 이름이 중복되었는지 확인합니다.',
  })
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
  @ApiOperation({
    summary: '회원가입이 필요한 유저인지 확인',
    description:
      '카카오톡 로그인은 했으나 회원가입은 아직 하지 않은 유저인지 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '회원가입 이미 했을 시 true',
    type: Boolean,
  })
  async checkSignupNeeded(@AccessUser() user: JwtPayload): Promise<boolean> {
    return await this.usersService.validateUser(user.id);
  }

  @Get()
  @ApiOperation({
    summary: '쿠키 테스트',
    description:
      '쿠키 제공을 위한 테스트 API입니다. 쿠키가 정상적으로 설정되었는지 확인합니다.',
  })
  setCookie(@Res() res: Response) {
    // 쿠키 설정
    res.cookie('access-token', 'secretkey', {
      httpOnly: true, // 클라이언트 측에서 쿠키에 접근하지 못하도록 설정
      secure: true, // HTTPS에서만 쿠키 전송
      sameSite: 'none', // 다른 도메인에서의 요청을 허용
    });
    res.cookie('refresh-token', 'secretkey', {
      httpOnly: true, // 클라이언트 측에서 쿠키에 접근하지 못하도록 설정
      secure: true, // HTTPS에서만 쿠키 전송
      sameSite: 'none', // 다른 도메인에서의 요청을 허용
    });
    res.redirect(process.env.DOMAIN);
    // res.send('Cookie has been set');
  }
}
