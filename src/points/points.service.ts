import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { GiftEntity } from './entities/gift.entity';
import { DrawEntity } from './entities/draw.entity';
import { HistoryEntity } from './entities/history.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getRanking() {
    /*const result = await this.userRepository.find({
      where: {},
      select: ['name', 'university', 'point'],
      relations: {
        point: true,
      },
    });

    const resultWithSumOfPoint = result.map((item) => {
      const point = item.point;
      const sumOfPoint =
        point.baseball +
        point.basketball +
        point.icehockey +
        point.rugby +
        point.football;

      return {
        name: item.name,
        university: item.university,
        point: sumOfPoint,
      };
    });

    return resultWithSumOfPoint.sort((a, b) => b.point - a.point);*/
    return [];
  }

  async drawForGift(giftId: number, user: UserEntity) {
    //해당 경품 번호가 있는지 확인
    /*
    const gift = await this.giftRepository.findOne({
      where: {
        id: giftId,
      },
    });

    if (!gift) {
      throw new NotFoundException('Not found giftId');
    }

    const userWithPoint = await this.userRepository.findOne({
      where: { id: user.id },
      relations: {
        point: true,
      },
    });

    //remaining poit가 응모 포인트보다 큰지 확인
    if (userWithPoint.point.remainingPoint < gift.requiredPoint) {
      throw new BadRequestException('Not Enough point to draw');
    }

    //경품 응모 트랜잭션 생성
    await this.dataSource
      .transaction(async (manager) => {
        //포인트 삭감
        userWithPoint.point.remainingPoint -= gift.requiredPoint;

        //응모 정보 생성
        const draw = await manager.create(DrawEntity, {
          user,
          gift,
        });

        //포인트 내역 생성
        const history = await manager.create(HistoryEntity, {
          usage: 1,
          usedPoint: gift.requiredPoint,
          user,
        });

        await manager.save(userWithPoint);
        await manager.save(draw);
        await manager.save(history);
      })
      .catch((e) => {
        console.error(e);
      });
*/
    return;
  }
}
