import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftEntity } from './entities/gift.entity';
import { DrawEntity } from './entities/draw.entity';
import { TicketEntity } from './entities/ticket.entity';
import { HistoryService } from './history.service';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
    @InjectRepository(DrawEntity)
    private readonly drawRepository: Repository<DrawEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    private readonly historyService: HistoryService,
  ) {}

  async getTicketCount(userId: string): Promise<number> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    return ticket.count;
  }

  async changeTicketCount(
    userId: string,
    changeAmount: number,
    description: string,
  ): Promise<number> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    const resultAmount = ticket.count + changeAmount;

    if (resultAmount < 0)
      throw new BadRequestException("Don't have enough ticket!");

    await this.ticketRepository.update(
      { id: ticket.id },
      { count: resultAmount },
    );

    await this.historyService.createHistory(
      userId,
      changeAmount,
      resultAmount,
      description,
    );

    return resultAmount;
  }
}
