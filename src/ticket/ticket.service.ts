import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TicketEntity } from './entities/ticket.entity';
import { HistoryService } from './history.service';

@Injectable()
export class TicketService {
  constructor(
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
    entityManager?: EntityManager,
  ): Promise<number> {
    const ticket = entityManager
      ? await entityManager.findOne(TicketEntity, {
          where: {
            user: {
              id: userId,
            },
          },
        })
      : await this.ticketRepository.findOne({
          where: {
            user: {
              id: userId,
            },
          },
        });

    const resultAmount = ticket.count + changeAmount;

    if (resultAmount < 0)
      throw new BadRequestException("Don't have enough ticket!");

    entityManager
      ? await entityManager.update(
          TicketEntity,
          { id: ticket.id },
          { count: resultAmount },
        )
      : await this.ticketRepository.update(
          { id: ticket.id },
          { count: resultAmount },
        );

    await this.historyService.createHistory(
      userId,
      changeAmount,
      resultAmount,
      description,
      entityManager,
    );

    return resultAmount;
  }
}
