import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheerEntity } from './entities/cheer.entity';
import { CheerDto } from './dto/cheer.dto';
import { University } from 'src/common/enums/university.enum';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class CheersService {
  constructor(
    @InjectRepository(CheerEntity)
    private readonly cheerRepository: Repository<CheerEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async cheerUniv(cheerDto: CheerDto, userId: string) {
    const existingRecord = await this.cheerRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingRecord) {
      existingRecord.univ = cheerDto.univ;
      await this.cheerRepository.save(existingRecord);
    } else {
      const cheer = new CheerEntity();
      cheer.univ = cheerDto.univ;
      cheer.user = await this.userRepository.findOne({ where: { id: userId } });
      await this.cheerRepository.save(cheer);
    }

    return await this.getRate();
  }

  // TODO: 캐싱이라던지.. 좀 더 효율이 필요.
  async getRate() {
    const korea = await this.cheerRepository.count({
      where: { univ: University.Korea },
    });
    const yonsei = await this.cheerRepository.count({
      where: { univ: University.Yonsei },
    });
    return (korea + yonsei) / korea;
  }
}
