import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftEntity } from './entities/gift.entity';
import { DrawEntity } from './entities/draw.entity';
import { TicketEntity } from './entities/ticket.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
    @InjectRepository(DrawEntity)
    private readonly drawRepository: Repository<DrawEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
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
}
