import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { GiftService } from './gift.service';
import { DrawGiftListDto } from './dto/draw-gift.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { GetGiftDto } from './dto/get-gift.dto';
import { GetDrawCountDto } from './dto/get-drawCount.dto';

@ApiTags('ticket')
@Controller('ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly historyService: HistoryService,
    private readonly giftService: GiftService,
  ) {}

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '본인 응모권 갯수 조회',
    description: '본인의 현재 응모권 개수를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '응모권 개수 조회 성공',
    type: Number,
  })
  async getMyTicketCount(@Req() req): Promise<number> {
    return this.ticketService.getTicketCount(req.user.id);
  }

  @Get('/history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '응모권 획득 및 사용 내역 조회',
    description: '응모권 획득 및 사용내역을 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    description: '조회하고자 하는 페이지(없으면 1페이지)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '내역 조회 성공',
    type: [GetHistoryDto],
  })
  async getMyTicketHistory(@Req() req, @Query('page') page?: number) {
    return this.historyService.getHistory(req.user.id, page);
  }

  @Get('/gift')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '경품 목록 조회',
    description: '경품 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '내역 조회 성공',
    type: [GetGiftDto],
  })
  async getGiftList() {
    return this.giftService.getGiftList();
  }

  @Post('/draw')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '경품 응모',
    description:
      '경품에 응모합니다. 응모권 사용 내역이 생성되며 응모권 수가 부족할 경우 시도된 모든 응모가 취소됩니다.',
  })
  @ApiBody({
    type: DrawGiftListDto,
  })
  @ApiResponse({
    status: 201,
    description: '경품 응모 성공',
  })
  async drawGift(@Req() req, @Body() draws: DrawGiftListDto) {
    return this.giftService.drawGift(req.user.id, draws.draws);
  }

  @Get('/draw')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '경품 응모 참여인원 조회',
    description:
      '경품별로 응모 수를 조회합니다. 또한 현재 사용자의 경품 별 응모 횟수도 함께 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '경품 응모참여인원 조회 성공',
    type: GetDrawCountDto,
  })
  async getDrawCount(@Req() req) {
    return this.giftService.getDrawCount(req.user.id);
  }
}
