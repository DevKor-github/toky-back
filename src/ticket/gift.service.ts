import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GiftEntity } from './entities/gift.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GiftService {
  constructor(
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
  ) {}

  async getGiftList(): Promise<GiftEntity[]> {
    return await this.giftRepository.find();
  }
}
