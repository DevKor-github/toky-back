import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from 'src/users/dto/user-info.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { TicketEntity } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { ProfileDto } from './dto/profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    private readonly ticektService: TicketService,
  ) {}

  async findOrCreateById(id: string): Promise<UserInfoDto> {
    let user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      user = this.userRepository.create({ id });
      this.userRepository.save(user);
    }
    return new UserInfoDto(user);
  }

  async findUserById(id: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['ticket'],
    });
  }

  async getUserProfile(id: string): Promise<ProfileDto> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new ProfileDto(user);
  }

  async isValidName(name: string): Promise<boolean> {
    return (await this.userRepository.findOne({ where: { name } }))
      ? false
      : true;
  }

  async signup(signupDto: SignupDto, id: string): Promise<void> {
    const { university, name, phoneNumber } = signupDto;
    const user = await this.findUserById(id);

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

  async validateUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user.phoneNumber ? true : false;
  }

  async updateName(id: string, name: string): Promise<ProfileDto> {
    const user = await this.findUserById(id);

    if (!user) {
      throw new NotFoundException('user not found!');
    }

    const updated = await this.userRepository.update(id, { name });
    if (updated.affected === 0) {
      throw new InternalServerErrorException('update failed');
    }

    user.name = name;
    return new ProfileDto(user);
  }
}
