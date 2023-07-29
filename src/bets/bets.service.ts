import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { BetAnswerEntity } from './entities/betAnswer.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateBetAnswerDto } from './dto/create-bet-answer.dto';
import { UpdateBetAnswerDto } from './dto/update-bet-answer.dto';
import { BetQuestionEntity } from './entities/betQuestion.entity';
import { Match } from 'src/common/enums/event.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantsResponseDto } from './dto/participantsResponse.dto';
import { University } from 'src/common/enums/university.enum';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(BetAnswerEntity)
    private readonly betAnswerRepository: Repository<BetAnswerEntity>,
    @InjectRepository(BetQuestionEntity)
    private readonly betQuestionRepository: Repository<BetQuestionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getBetQuestions(match: Match) {
    return this.betQuestionRepository.find({
      where: {
        match,
      },
    });
  }

  async createBetAnswer(userid: string, createDto: CreateBetAnswerDto) {
    const { questionId, answer } = createDto;
    console.log(questionId, answer);
    const question = await this.betQuestionRepository.findOne({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException(
        'An betting question with requested questionId does not exist',
      );
    }
    const user = await this.userRepository.findOne({ where: { id: userid } });
    const result = this.betAnswerRepository.create({
      user,
      question,
      answer,
    });

    try {
      await this.betAnswerRepository.save(result);
      return { answerId: result.id };
    } catch (e) {
      throw e;
    }
  }

  async getBetAnswers(userId: string) {
    return this.betAnswerRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        question: true,
      },
    });
  }

  async updateBetAnswer(userId: string, updateDto: UpdateBetAnswerDto) {
    const { answerId, answer } = updateDto;
    const betAnswer = await this.betAnswerRepository.findOne({
      where: {
        id: answerId,
        user: { id: userId },
      },
    });

    if (!betAnswer) {
      throw new NotFoundException(
        'An betting answer with requested questionId does not exist',
      );
    }

    betAnswer.answer = answer;

    try {
      await this.betAnswerRepository.save(betAnswer);
    } catch (e) {
      throw e;
    }
  }

  async getTotalPredictions(userId: string) {
    const questionId = [1, 2, 3, 4, 5]; //승부에 대한 예측 question id 5개 설정
    const matchAnswer: Promise<BetAnswerEntity>[] = [];
    let numWinKorea = 0;
    let numWinYonsei = 0;
    let numDraw = 0;
    const betAnswer = await this.betAnswerRepository.find({
      where: {
        user: {
          id: userId,
        },
        question: {
          id: In(questionId),
        },
      },
    });
    const result = betAnswer.map((betAnswer: BetAnswerEntity) => {
      if (betAnswer.answer == 0) numWinKorea++;
      else if (betAnswer.answer == 1) numDraw++;
      else numWinYonsei++;
    });

    return { numWinKorea, numWinYonsei, numDraw };
  }

  // TODO: 캐싱
  async getBetParticipants(): Promise<ParticipantsResponseDto> {
    const usersWithBetAnswer = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.bets', 'betAnswer')
      .getMany();

    const korea = usersWithBetAnswer.filter(
      (user) => user.university === University.Korea,
    ).length;

    return { korea, yonsei: usersWithBetAnswer.length - korea };
  }
}
