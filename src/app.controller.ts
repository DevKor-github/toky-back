import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health-check')
  @ApiOperation({
    summary: '서버 헬스체크',
    description:
      '프론트 서버와 백엔드 서버가 모두 정상적인지 확인합니다. (이 요청 자체가 실패하면 백엔드 서버가 비정상)',
  })
  @ApiResponse({
    status: 200,
    description: '프론트 서버 정상( GET / 요청 성공 )',
  })
  @ApiResponse({
    status: 500,
    description: '프론트 서버 비정상( GET / 요청 실패 )',
  })
  async healthCheck(@Res() res): Promise<void> {
    const status = await this.appService.healthCheck();
    res.status(status).send();
  }
}
