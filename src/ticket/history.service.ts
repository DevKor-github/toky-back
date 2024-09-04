import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryEntity } from './entities/history.entity';
import { EntityManager, Repository } from 'typeorm';
import { GetHistoryDto } from './dto/get-history.dto';

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
    entityManager?: EntityManager,
  ): Promise<HistoryEntity> {
    const history = this.historyRepository.create({
      user: {
        id: userId,
      },
      usedTicket,
      remainingTicket,
      detail,
    });

    return entityManager
      ? await entityManager.save(history)
      : await this.historyRepository.save(history);
  }

  async getHistory(userId: string): Promise<GetHistoryDto[]> {
    const histories = await this.historyRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC', remainingTicket: 'ASC' },
    });

    const result: GetHistoryDto[] = histories.map((history) => {
      const resultDto: GetHistoryDto = {
        id: history.id,
        detail: history.detail,
        usedTicket: history.usedTicket,
        remainingTicket: history.remainingTicket,
        createdAt: new Date(history.createdAt.getTime() + 9 * 60 * 60 * 1000),
      };
      return resultDto;
    });
    return result;
  }
}
