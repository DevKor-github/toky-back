import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from 'src/users/dto/user-info.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { PhoneEntity } from 'src/auth/entities/phone.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PhoneEntity)
    private readonly phoneRepository: Repository<PhoneEntity>,
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

    const phone = await this.phoneRepository.findOne({
      where: { user: { id }, isValid: true },
    });
    if (!phone) {
      // TODO: 에러
      throw new Error('휴대폰 인증이 되어있지 않습니다.');
    }
    user.name = name;
    user.phoneNumber = phoneNumber;
    user.university = university;
    await this.userRepository.save(user);
  }
}
