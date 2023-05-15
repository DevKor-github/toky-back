import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from 'src/common/enums/event.enum';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async getRanking(match?: Match) {
    const matchArr = [
      'baseball',
      'basketball',
      'icehockey',
      'rugby',
      'football',
    ];
    const m = matchArr[match];

    //전체 랭킹 조회시 (match === undefined)
    if (!m) {
      const result = await this.userRepository.find({
        where: {},
        select: ['name', 'university', 'point'],
        relations: {
          point: true,
        },
      });

      const addedResult = result.map((item) => {
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

      return addedResult.sort((a, b) => b.point - a.point);
    }

    const result = await this.userRepository.find({
      where: {},
      select: {
        name: true,
        university: true,
        point: {
          [m]: true,
        },
      },
      relations: {
        point: true,
      },
      order: {
        point: {
          [m]: 'DESC',
        },
      },
    });

    return result.map((item) => {
      return {
        name: item.name,
        university: item.university,
        point: item.point[m],
      };
    });
  }
}
