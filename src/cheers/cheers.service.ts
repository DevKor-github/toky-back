import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheerEntity } from './entities/cheer.entity';
import { CheerDto } from './dto/cheer.dto';
import { University } from 'src/common/enums/university.enum';
import { CheerRateDto } from './dto/cheerRate.dto';

@Injectable()
export class CheersService {
  constructor(
    @InjectRepository(CheerEntity)
    private readonly cheerRepository: Repository<CheerEntity>,
  ) {}

  async cheerUniv(cheerDto: CheerDto, userId: string): Promise<void> {
    const existingRecord = await this.cheerRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingRecord) {
      if (existingRecord.univ !== cheerDto.univ) {
        existingRecord.univ = cheerDto.univ;
        await this.cheerRepository.save(existingRecord);
      }
    } else {
      const newRecord = this.cheerRepository.create({
        univ: cheerDto.univ,
        user: { id: userId },
      });
      await this.cheerRepository.save(newRecord);
    }
  }

  // TODO: 캐싱이라던지.. 좀 더 효율이 필요.
  async getRate(): Promise<CheerRateDto> {
    const korea = await this.cheerRepository.count({
      where: { univ: University.Korea },
    });
    const yonsei = await this.cheerRepository.count({
      where: { univ: University.Yonsei },
    });

    const result: CheerRateDto = {
      participants: [korea, yonsei],
    };
    return result;
  }

  async getCheer(userId: string): Promise<CheerDto> {
    const existingRecord = await this.cheerRepository.findOne({
      where: { user: { id: userId } },
    });
    const result: CheerDto = {
      univ: existingRecord ? existingRecord.univ : null,
    };

    return result;
  }
}
