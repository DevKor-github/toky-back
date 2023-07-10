import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { CheerDto } from './dto/cheer.dto';
import { CheersService } from './cheers.service';

@Controller('cheers')
export class CheersController {
  constructor(private readonly cheerService: CheersService) {}

  @Post('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '응원하기' })
  async drawForGift(@Body() cheerDto: CheerDto, @Req() req) {
    return this.cheerService.cheerUniv(cheerDto, req.user.id);
  }
}
