import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from 'src/users/dto/user-info.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { PhoneEntity } from 'src/auth/entities/phone.entity';
import { TicketEntity } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PhoneEntity)
    private readonly phoneRepository: Repository<PhoneEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    private readonly ticektService: TicketService,
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
      relations: ['ticket'],
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

    const ticketEntity = this.ticketRepository.create({
      user,
      count: 0,
    });
    await this.ticketRepository.save(ticketEntity);

    user.name = name;
    user.phoneNumber = phoneNumber;
    user.university = university;
    user.ticket = ticketEntity;
    await this.userRepository.save(user);

    await this.ticektService.changeTicketCount(
      user.id,
      1,
      '가입 환영 응모권 1장 지급',
    );
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
