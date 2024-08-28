import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GiftEntity } from './entities/gift.entity';
import { DataSource, Repository } from 'typeorm';
import { DrawEntity } from './entities/draw.entity';
import { DrawGiftDto, DrawGiftListDto } from './dto/draw-gift.dto';
import { TicketService } from './ticket.service';
import { GetGiftDto } from './dto/get-gift.dto';

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

  async getGiftList(): Promise<GetGiftDto[]> {
    const gifts = await this.giftRepository.find({
      relations: {
        draws: true,
      },
      order: {
        id: 'ASC',
      },
    });
    const result: GetGiftDto[] = gifts.map((gift) => {
      const giftDto: GetGiftDto = {
        id: gift.id,
        name: gift.name,
        alias: gift.alias,
        requiredTicket: gift.requiredTicket,
        photoUrl: gift.photoUrl,
        count: gift.draws.length,
      };

      return giftDto;
    });

    return result;
  }

  async drawGift(userId: string, draws: DrawGiftDto[]): Promise<void> {
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
            queryRunner.manager,
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
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getDrawCount(userId: string): Promise<DrawGiftListDto> {
    const myResult: DrawGiftDto[] = await this.drawRepository
      .createQueryBuilder('draw')
      .select('draw.gift_id', 'giftId')
      .addSelect('COUNT(*)', 'count')
      .where('draw.user_id = :userId', { userId })
      .groupBy('draw.gift_id')
      .orderBy('draw.gift_id')
      .getRawMany();

    const result: DrawGiftListDto = {
      draws: myResult,
    };

    return result;
  }
}
