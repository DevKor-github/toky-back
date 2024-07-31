import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { GiftService } from './gift.service';

@Controller('ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly historyService: HistoryService,
    private readonly giftService: GiftService,
  ) {}

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '본인 응모권 갯수 조회' })
  async getMyTicketCount(@Req() req): Promise<number> {
    return this.ticketService.getTicketCount(req.user.id);
  }

  @Get('/history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '응모권 획득 및 사용 내역 조회' })
  async getMyTicketHistory(@Req() req, @Query('page') page?: number) {
    return this.historyService.getHistory(req.user.id, page);
  }

  @Get('/gift')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '경품 목록 조회' })
  async getGiftList() {
    return this.giftService.getGiftList();
  }
}
