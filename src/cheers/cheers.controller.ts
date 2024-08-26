import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CheerDto } from './dto/cheer.dto';
import { CheersService } from './cheers.service';
import { CheerRateDto } from './dto/cheerRate.dto';
import { AccessUser } from 'src/common/decorators/accessUser.decorator';
import { JwtPayload } from 'src/common/interfaces/auth.interface';

@ApiTags('cheers')
@Controller('cheers')
export class CheersController {
  constructor(private readonly cheerService: CheersService) {}

  @Post('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '응원하기',
    description:
      '고려대 or 연세대를 응원합니다. 이미 응원했다면 응원을 변경합니다.',
  })
  @ApiBody({
    type: CheerDto,
  })
  @ApiResponse({
    status: 201,
    description: '응원하기 성공',
  })
  async cheerUniv(@AccessUser() user: JwtPayload, @Body() cheerDto: CheerDto) {
    await this.cheerService.cheerUniv(cheerDto, user.id);
  }

  @Get('/participants')
  @ApiOperation({
    summary: '응원 참여자 조회하기',
    description: '각 학교별 응원하는 유저 수를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '응원 참여자 조회 성공',
    type: CheerRateDto,
  })
  async getCheerRate() {
    return await this.cheerService.getRate();
  }

  @Get('/my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 응원 학교 조회하기',
    description: '현재 사용자가 응원한 학교를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '응원 학교 조회 성공',
    type: CheerDto,
  })
  async getMyCheer(@AccessUser() user: JwtPayload) {
    return await this.cheerService.getCheer(user.id);
  }
}
