import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, MoreThan, Not, Repository } from 'typeorm';
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
      where: {
        point: Not(IsNull()),
      },
      take: take,
      skip: (page - 1) * take,
    });

    const topRank = await this.getRankById(users[0].id);

    const result = users.map((user, idx, array) => {
      let rank = (page - 1) * take + idx + 1;
      let i = 1;
      while (
        idx - i >= 0 &&
        array[idx - i].point.totalPoint === user.point.totalPoint
      ) {
        rank--;
        i++;
      }
      if (idx - i <= 0 && array[0].point.totalPoint === user.point.totalPoint)
        rank = topRank;
      return {
        name: user.name,
        university: user.university,
        point: user.point.totalPoint,
        rank: rank,
      };
    });

    return {
      users: result,
      total,
      page,
      last_page: Math.ceil(total / take),
    };
  }

  async getRankingListByRankAndId(rank: number, id: string) {
    const TAKE = 10;
    let page = Math.floor(rank / TAKE);
    let [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'name', 'university', 'point'],
      relations: {
        point: true,
      },
      order: {
        point: {
          totalPoint: 'DESC',
        },
        name: 'DESC',
      },
      where: {
        point: Not(IsNull()),
      },
      take: TAKE,
      skip: page * TAKE,
    });
    while (users.findIndex((user) => user.id === id) === -1) {
      page++;
      [users, total] = await this.userRepository.findAndCount({
        select: ['id', 'name', 'university', 'point'],
        relations: {
          point: true,
        },
        order: {
          point: {
            totalPoint: 'DESC',
          },
          name: 'DESC',
        },
        where: {
          point: Not(IsNull()),
        },
        take: TAKE,
        skip: page * TAKE,
      });
    }

    const topRank = await this.getRankById(users[0].id);
    const result = users.map((user, idx, array) => {
      let rank = page * TAKE + idx + 1;
      let i = 1;
      while (
        idx - i >= 0 &&
        array[idx - i].point.totalPoint === user.point.totalPoint
      ) {
        rank--;
        i++;
      }
      if (idx - i <= 0 && array[0].point.totalPoint === user.point.totalPoint)
        rank = topRank;
      return {
        name: user.name,
        university: user.university,
        point: user.point.totalPoint,
        rank: rank,
      };
    });

    return {
      users: result,
      total,
      page: page + 1,
      rank: rank,
      last_page: Math.ceil(total / TAKE),
    };
  }

  async getRankingListByRankAndName(rank: number, name: string) {
    const TAKE = 10;
    let page = Math.floor(rank / TAKE);
    let [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'name', 'university', 'point'],
      relations: {
        point: true,
      },
      order: {
        point: {
          totalPoint: 'DESC',
        },
        name: 'DESC',
      },
      where: {
        point: Not(IsNull()),
      },
      take: TAKE,
      skip: page * TAKE,
    });

    while (users.findIndex((user) => user.name === name) === -1) {
      page++;
      [users, total] = await this.userRepository.findAndCount({
        select: ['id', 'name', 'university', 'point'],
        relations: {
          point: true,
        },
        order: {
          point: {
            totalPoint: 'DESC',
          },
          name: 'DESC',
        },
        where: {
          point: Not(IsNull()),
        },
        take: TAKE,
        skip: page * TAKE,
      });
    }

    const topRank = await this.getRankById(users[0].id);
    const result = users.map((user, idx, array) => {
      let rank = page * TAKE + idx + 1;
      let i = 1;
      while (
        idx - i >= 0 &&
        array[idx - i].point.totalPoint === user.point.totalPoint
      ) {
        rank--;
        i++;
      }
      if (idx - i <= 0 && array[0].point.totalPoint === user.point.totalPoint)
        rank = topRank;
      return {
        name: user.name,
        university: user.university,
        point: user.point.totalPoint,
        rank: rank,
      };
    });

    return {
      users: result,
      total,
      page: page + 1,
      rank: rank,
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
      where: {
        point: Not(IsNull()),
      },
      take: TAKE,
    });
    const result = users.map((user, idx, array) => {
      let rank = idx + 1;
      let i = 1;
      while (
        idx - i >= 0 &&
        array[idx - i].point &&
        array[idx - i].point.totalPoint === user.point.totalPoint
      ) {
        rank--;
        i++;
      }
      return {
        name: user.name,
        university: user.university,
        point: user.point.totalPoint,
        rank: rank,
      };
    });

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
              detail: `${gift.name} 경품 응모 참여!`,
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
