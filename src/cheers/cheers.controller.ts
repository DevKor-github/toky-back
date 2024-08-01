import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheerDto } from './dto/cheer.dto';
import { CheersService } from './cheers.service';

@ApiTags('cheers')
@Controller('cheers')
export class CheersController {
  constructor(private readonly cheerService: CheersService) {}

  @Post('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '응원하기' })
  async drawForGift(@Body() cheerDto: CheerDto, @Req() req) {
    await this.cheerService.cheerUniv(cheerDto, req.user.id);
  }

  @Get('/participants')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '응원 참여자 조회하기' })
  async getParticipants(@Req() req) {
    return await this.cheerService.getRate(req.user.id);
  }
}
