import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/user-info.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';

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

  async findUserById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async signup(signupDto: SignupDto, id: string) {
    const { university, name, phoneNumber } = signupDto;
    const user = await this.findUserById(id);
    user.name = name;
    user.phoneNumber = phoneNumber;
    user.university = university;
    await this.userRepository.save(user);
  }
}
