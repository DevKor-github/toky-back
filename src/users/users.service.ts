import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/user-info.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOrCreateById(id: string) {
    let user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      user = this.userRepository.create({ id });
      user = await this.userRepository.save(user);
    }
    const userInfoDto: UserInfoDto = new UserInfoDto(user);
    return userInfoDto;
  }
}
