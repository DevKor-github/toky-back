import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from 'src/users/dto/user-info.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { PhoneEntity } from 'src/auth/entities/phone.entity';
import { PointEntity } from 'src/points/entities/point.entity';
import { HistoryEntity } from 'src/points/entities/history.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PhoneEntity)
    private readonly phoneRepository: Repository<PhoneEntity>,
    @InjectRepository(PointEntity)
    private readonly pointRepository: Repository<PointEntity>,
    @InjectRepository(HistoryEntity)
    private readonly historyRepository: Repository<HistoryEntity>,
  ) {}

  async findOrCreateById(id: string) {
    let user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      user = this.userRepository.create({ id });
      this.userRepository.save(user);
    }
    const userInfoDto: UserInfoDto = new UserInfoDto(user);
    return userInfoDto;
  }

  async findUserById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['point'],
    });
  }

  async isValidName(name: string) {
    return (await this.userRepository.findOne({ where: { name } }))
      ? false
      : true;
  }
  async isValidPhoneNumber(phoneNumber: string) {
    return (await this.userRepository.findOne({
      where: { phoneNumber },
    }))
      ? false
      : true;
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
    const pointEntity = await this.pointRepository.create({
      remainingPoint: 100,
      totalPoint: 100,
    });
    await this.pointRepository.save(pointEntity);

    const historyEntity = await this.historyRepository.create({
      detail: '가입 완료 시 지급',
      usedPoint: 100,
      remainedPoint: 100,
      user: user,
    });
    await this.historyRepository.save(historyEntity);

    user.name = name;
    user.phoneNumber = phoneNumber;
    user.university = university;
    user.point = pointEntity;
    await this.userRepository.save(user);
  }
  async validateUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return user.phoneNumber ? true : false;
  }

  async updateName(id: string, name: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    user.name = name;
    await this.userRepository.save(user);
  }
}
