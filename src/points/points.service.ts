import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { GiftEntity } from './entities/gift.entity';
import { DrawEntity } from './entities/draw.entity';
import { HistoryEntity } from './entities/history.entity';
import { DrawGiftDto } from './dto/draw-gift.dto';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
    @InjectRepository(DrawEntity)
    private readonly drawRepository: Repository<DrawEntity>,
    @InjectRepository(HistoryEntity)
    private readonly historyRepository: Repository<HistoryEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getRanking(page: number) {
    const take = 10;

    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'name', 'university', 'point'],
      relations: {
        point: true,
      },
      order: {
        point: {
          totalPoint: 'DESC',
        },
      },
      take: take,
      skip: (page - 1) * take,
    });

    const result = users.map((user, idx) => ({
      id: user.id,
      name: user.name,
      university: user.university,
      point: user.point.totalPoint,
      rank: (page - 1) * take + idx + 1,
    }));

    return {
      users: result,
      total,
      page,
      last_page: Math.ceil(total / take),
    };
  }
  async getRankingListByRank(rank: number) {
    const TAKE = 10;
    const page = Math.floor(rank / TAKE);
    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'name', 'university', 'point'],
      relations: {
        point: true,
      },
      order: {
        point: {
          totalPoint: 'DESC',
        },
      },
      take: TAKE,
      skip: page * TAKE,
    });
    const result = users.map((user, idx) => ({
      id: user.id,
      name: user.name,
      university: user.university,
      point: user.point.totalPoint,
      rank: page * TAKE + idx + 1,
    }));

    return {
      users: result,
      total,
      page: page + 1,
      last_page: Math.ceil(total / TAKE),
    };
  }

  async getRankByName(name: string) {
    const user = await this.userRepository.findOne({
      where: {
        name: name,
      },
      relations: ['point'],
    });
    if (!user) return -1;

    const rankingCount = await this.userRepository.count({
      where: {
        point: {
          totalPoint: MoreThan(user.point.totalPoint),
        },
      },
    });

    return rankingCount + 1;
  }

  async getRankById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: ['point'],
    });
    if (!user) return -1;

    const rankingCount = await this.userRepository.count({
      where: {
        point: {
          totalPoint: MoreThan(user.point.totalPoint),
        },
      },
    });

    return rankingCount + 1;
  }

  async getRankInfo(id: string) {
    const TAKE = 10;
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: ['point'],
    });
    if (!user) return -1;

    const rankingCount = await this.userRepository.count({
      where: {
        point: {
          totalPoint: MoreThan(user.point.totalPoint),
        },
      },
    });
    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'name', 'university', 'point'],
      relations: {
        point: true,
      },
      order: {
        point: {
          totalPoint: 'DESC',
        },
      },
      take: TAKE,
    });
    const result = users.map((user, idx) => ({
      name: user.name,
      university: user.university,
      point: user.point.totalPoint,
      rank: idx + 1,
    }));

    return {
      rank: rankingCount + 1,
      point: user.point.totalPoint,
      total: total,
      rankList: result,
    };
  }

  async drawForGift(draws: DrawGiftDto[], id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        point: true,
      },
    });

    await this.dataSource
      .transaction(async (manager) => {
        for (let i = 0; i < draws.length; i++) {
          const { giftId, count } = draws[i];
          const gift = await this.giftRepository.findOne({
            where: {
              id: giftId,
            },
          });

          if (!gift) {
            throw new NotFoundException(`Not found giftId ${giftId}`);
          }

          if (user.point.remainingPoint < gift.requiredPoint * count) {
            throw new BadRequestException('Not Enough point to draw');
          }

          for (let j = 0; j < count; j++) {
            //포인트 삭감
            user.point.remainingPoint -= gift.requiredPoint;

            //응모 정보 생성
            const draw = await manager.create(DrawEntity, {
              user,
              gift,
            });

            //포인트 내역 생성
            const history = await manager.create(HistoryEntity, {
              detail: gift.name,
              usedPoint: -gift.requiredPoint,
              remainedPoint: user.point.remainingPoint,
              user,
            });

            await manager.save(draw);
            await manager.save(history);
          }
        }

        await manager.save(user);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  async getMyPoint(id: string) {
    const result = await this.userRepository.findOne({
      select: ['point'],
      relations: {
        point: true,
      },
      where: { id: id },
    });
    const { remainingPoint, totalPoint } = result.point;
    return { remainingPoint, totalPoint };
  }

  async getAllandMyDrawParticipants(id: string) {
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
      .where('draw.user_id = :userId', { userId: id })
      .groupBy('draw.gift_id')
      .getRawMany();

    return [allResult, myResult];
  }

  async getMyPointHistory(id: string, page: number) {
    const take = 10;
    const result = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.user_id = :userId', { userId: id })
      .orderBy('created_at', 'DESC')
      .take(take)
      .skip((page - 1) * take)
      .getMany();
    console.log(result);
    return result;
  }

  async getGifts() {
    const result = await this.giftRepository.find();
    return result;
  }
}
