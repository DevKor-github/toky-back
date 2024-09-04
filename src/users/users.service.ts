import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { UserInfoDto } from 'src/users/dto/user-info.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { TicketEntity } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { ProfileDto } from './dto/profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AnswerCountEntity } from 'src/bets/entities/answerCount.entity';
import { BetsService } from 'src/bets/bets.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly ticektService: TicketService,
    private readonly betService: BetsService,
  ) {}

  async findOrCreateById(id: string): Promise<UserInfoDto> {
    let user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      user = this.userRepository.create({
        id,
        inviteCode: this.generateRandomString(),
      });
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

  async signup(
    transactionManager: EntityManager,
    signupDto: SignupDto,
    id: string,
  ): Promise<void> {
    const { university, name, phoneNumber } = signupDto;
    const user = await transactionManager.findOne(UserEntity, {
      where: { id },
    });

    const ticketEntity = transactionManager.create(TicketEntity, {
      user,
      count: 0,
    });
    await transactionManager.save(ticketEntity);

    const answerCountEntity = transactionManager.create(AnswerCountEntity, {
      user,
      rank: await this.betService.getLastRank(transactionManager),
    });
    await transactionManager.save(answerCountEntity);

    user.name = name;
    user.phoneNumber = phoneNumber;
    user.university = university;
    user.ticket = ticketEntity;
    user.answerCount = answerCountEntity;
    await transactionManager.save(user);

    if (signupDto.inviteCode) {
      const inviteUser = await transactionManager.findOne(UserEntity, {
        where: { inviteCode: signupDto.inviteCode },
      });

      if (inviteUser) {
        await this.ticektService.changeTicketCount(
          inviteUser.id,
          1,
          '친구초대 이벤트 참여',
          transactionManager,
        );

        await this.ticektService.changeTicketCount(
          user.id,
          1,
          '친구초대 이벤트 참여',
          transactionManager,
        );
      }
    }

    await this.ticektService.changeTicketCount(
      user.id,
      1,
      '가입을 축하합니다!',
      transactionManager,
    );
  }

  async validateUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user.phoneNumber ? true : false;
  }

  async updateProfile(
    id: string,
    requestDto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    const user = await this.findUserById(id);

    if (!user) {
      throw new NotFoundException('user not found!');
    }

    const updated = await this.userRepository.update(id, requestDto);
    if (updated.affected === 0) {
      throw new InternalServerErrorException('update failed');
    }

    return new ProfileDto(await this.findUserById(id));
  }

  private generateRandomString(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const timestamp = new Date().getTime().toString();
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    result += timestamp;
    return result;
  }
}
