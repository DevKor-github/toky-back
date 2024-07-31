import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ description: '본인 응모권 갯수 조회' })
  async getMyTicketCount(@Req() req): Promise<number> {
    return this.ticketService.getTicketCount(req.user.id);
  }
}
