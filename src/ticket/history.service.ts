import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryEntity } from './entities/history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryEntity)
    private readonly historyRepository: Repository<HistoryEntity>,
  ) {}

  async createHistory(
    userId: string,
    usedTicket: number,
    remainingTicket: number,
    detail: string,
  ): Promise<HistoryEntity> {
    const history = this.historyRepository.create({
      user: {
        id: userId,
      },
      usedTicket,
      remainingTicket,
      detail,
    });

    return await this.historyRepository.save(history);
  }

  async getHistory(userId: string, page = 1) {
    const take = 13;
    const result = await this.historyRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC', remainingTicket: 'ASC' },
      take,
      skip: (page - 1) * take,
    });

    return result.map((history) => {
      return {
        id: history.id,
        detail: history.detail,
        usedTicket: history.usedTicket,
        remainingTicket: history.remainingTicket,
        createdAt: new Date(history.createdAt.getTime() + 9 * 60 * 60 * 1000),
      };
    });
  }
}
