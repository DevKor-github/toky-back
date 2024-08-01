import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GiftEntity } from './entities/gift.entity';
import { DataSource, Repository } from 'typeorm';
import { DrawEntity } from './entities/draw.entity';
import { DrawGiftDto } from './dto/draw-gift.dto';
import { TicketService } from './ticket.service';

@Injectable()
export class GiftService {
  constructor(
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
    @InjectRepository(DrawEntity)
    private readonly drawRepository: Repository<DrawEntity>,
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketService,
  ) {}

  async getGiftList(): Promise<GiftEntity[]> {
    return await this.giftRepository.find();
  }

  async drawGift(userId: string, draws: DrawGiftDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const draw of draws) {
        const gift = await this.giftRepository.findOne({
          where: {
            id: draw.giftId,
          },
        });
        if (!gift) throw new NotFoundException('Wrong GiftId!');
        for (let i = 0; i < draw.count; i++) {
          await this.ticketService.changeTicketCount(
            userId,
            -1 * gift.requiredTicket,
            `${gift.name} 경품 응모 참여!`,
          );
          const draw = queryRunner.manager.create(DrawEntity, {
            user: {
              id: userId,
            },
            gift,
          });
          await queryRunner.manager.save(draw);
        }
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getDrawCount(userId: string) {
    const allResult = await this.drawRepository
      .createQueryBuilder('draw')
      .select('draw.gift_id AS giftId')
      .addSelect('COUNT(*) AS drawCount')
      .groupBy('draw.gift_id')
      .getRawMany();
    const myResult = await this.drawRepository
      .createQueryBuilder('draw')
      .select('draw.gift_id AS giftId')
      .addSelect('COUNT(*) AS drawCount')
      .where('draw.user_id = :userId', { userId })
      .groupBy('draw.gift_id')
      .getRawMany();

    return [allResult, myResult];
  }
}
