import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { BetAnswerEntity } from './entities/betAnswer.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateBetAnswerDto } from './dto/create-bet-answer.dto';
import { BetQuestionEntity } from './entities/betQuestion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantsResponseDto } from './dto/get-participants.dto';
import { University } from 'src/common/enums/university.enum';
import { betQuestionResponseDto, Question } from './dto/get-bet-question.dto';
import { Match, MatchMap } from 'src/common/enums/event.enum';
import { TicketService } from 'src/ticket/ticket.service';
import { ToTalPredictionDto } from './dto/get-total-prediction.dto';
import { InputAnswerDto } from './dto/input-answer.dto';
import { GetRankDto } from './dto/get-rank.dto';
import { ShareEntity } from './entities/Share.entity';
import { AnswerCountEntity } from './entities/answerCount.entity';
@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(BetAnswerEntity)
    private readonly betAnswerRepository: Repository<BetAnswerEntity>,
    @InjectRepository(BetQuestionEntity)
    private readonly betQuestionRepository: Repository<BetQuestionEntity>,
    @InjectRepository(ShareEntity)
    private readonly shareRepository: Repository<ShareEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AnswerCountEntity)
    private readonly answerCountRepository: Repository<AnswerCountEntity>,
    private readonly ticketService: TicketService,
    private readonly dataSource: DataSource,
  ) {}

  async getBetInfo(id: string): Promise<betQuestionResponseDto> {
    const betQuestions = await this.betQuestionRepository.find({
      order: {
        index: 'ASC',
      },
    });
    const betAnswers = await this.betAnswerRepository.find({
      where: {
        user: { id },
      },
      relations: { question: true },
    });

    const result: betQuestionResponseDto = {
      baseball: [],
      football: [],
      basketball: [],
      rugby: [],
      icehockey: [],
    };

    for (const betQuestion of betQuestions) {
      const totalAnswerCount =
        betQuestion.choice1Count +
        betQuestion.choice2Count +
        betQuestion.choice3Count;
      const percentage = [
        betQuestion.choice1Count / totalAnswerCount,
        betQuestion.choice2Count / totalAnswerCount,
      ];
      if (betQuestion.choice.length === 3) {
        percentage.push(betQuestion.choice3Count / totalAnswerCount);
      }
      const response: Question = {
        questionId: betQuestion.id,
        description: betQuestion.description,
        choices: betQuestion.choice,
        myAnswer:
          betAnswers.find((answer) => answer.question.id === betQuestion.id)
            ?.answer ?? null,
        realAnswer:
          betQuestion.realAnswer !== -1 ? betQuestion.realAnswer : null,
        percentage,
      };
      switch (betQuestion.match) {
        case Match.Baseball:
          result.baseball.push(response);
          break;

        case Match.Football:
          result.football.push(response);
          break;

        case Match.Basketball:
          result.basketball.push(response);
          break;

        case Match.Rugby:
          result.rugby.push(response);
          break;

        case Match.Icehockey:
          result.icehockey.push(response);
          break;
      }
    }

    return result;
  }

  async createOrUpdateAnswer(
    userId: string,
    createDto: CreateBetAnswerDto,
  ): Promise<{
    status: number;
    percentage: number[];
  }> {
    const { questionId, answer } = createDto;

    const question = await this.betQuestionRepository.findOne({
      where: {
        id: questionId,
      },
    });

    if (!question)
      throw new NotFoundException(
        'An betting question with requested questionId does not exist',
      );

    if (answer >= question.choice.length || answer < 0)
      throw new BadRequestException('Answer is not valid');

    const choiceColumn = ['choice1Count', 'choice2Count', 'choice3Count'];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAnswer = await queryRunner.manager.findOne(
        BetAnswerEntity,
        {
          where: {
            user: { id: userId },
            question: { id: questionId },
          },
        },
      );

      if (existingAnswer) {
        if (existingAnswer.answer === answer)
          throw new BadRequestException('Same Answer!');

        await queryRunner.manager.decrement(
          BetQuestionEntity,
          { id: question.id },
          choiceColumn[existingAnswer.answer],
          1,
        );
        question[choiceColumn[existingAnswer.answer]] -= 1;

        await queryRunner.manager.update(
          BetAnswerEntity,
          {
            id: existingAnswer.id,
          },
          {
            answer,
          },
        );
      } else {
        await queryRunner.manager.insert(BetAnswerEntity, {
          user: { id: userId },
          question: { id: questionId },
          answer,
        });

        await this.ticketService.changeTicketCount(
          userId,
          1,
          `${MatchMap[question.match]} 종목 ${
            question.index
          }번 예측 참여로 응모권 1개 획득`,
          queryRunner.manager,
        );
      }

      await queryRunner.manager.increment(
        BetQuestionEntity,
        { id: question.id },
        choiceColumn[answer],
        1,
      );
      question[choiceColumn[answer]] += 1;

      await queryRunner.commitTransaction();
      const status = existingAnswer ? 200 : 201;
      const totalAnswerCount =
        question.choice1Count + question.choice2Count + question.choice3Count;
      const percentage = [
        question.choice1Count / totalAnswerCount,
        question.choice2Count / totalAnswerCount,
      ];
      if (question.choice.length === 3) {
        percentage.push(question.choice3Count / totalAnswerCount);
      }
      return {
        status,
        percentage,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTotalPredictions(userId: string): Promise<ToTalPredictionDto> {
    let numWinKorea = 0;
    let numWinYonsei = 0;
    let numDraw = 0;
    const betAnswer = await this.betAnswerRepository.find({
      where: {
        user: {
          id: userId,
        },
        question: {
          index: 1,
        },
      },
    });
    betAnswer.forEach((betAnswer: BetAnswerEntity) => {
      if (betAnswer.answer == 0) numWinKorea++;
      else if (betAnswer.answer == 1) numDraw++;
      else numWinYonsei++;
    });

    const result: ToTalPredictionDto = { numWinKorea, numWinYonsei, numDraw };

    return result;
  }

  async getSharePredictionTicket(userId: string): Promise<number> {
    const share = await this.shareRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });
    console.log(share);

    if (
      share &&
      share.lastSharePrediction &&
      share.lastSharePrediction.getTime() >=
        new Date().getTime() - 1000 * 60 * 60 * 24
    ) {
      throw new BadRequestException('Only can get ticket once a day!');
    }

    if (!share) {
      const newShare = this.shareRepository.create({
        user: { id: userId },
        lastSharePrediction: new Date(),
      });
      await this.shareRepository.save(newShare);
    } else {
      share.lastSharePrediction = new Date();
      await this.shareRepository.save(share);
    }

    return await this.ticketService.changeTicketCount(
      userId,
      1,
      '승부 예측 공유로 응모권 1장 획득',
    );
  }

  async getShareRankTicket(userId: string): Promise<number> {
    const share = await this.shareRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (
      share &&
      share.lastShareRank &&
      share.lastShareRank.getTime() >=
        new Date().getTime() - 1000 * 60 * 60 * 24
    ) {
      throw new BadRequestException('Only can get ticket once a day!');
    }

    if (!share) {
      const newShare = this.shareRepository.create({
        user: { id: userId },
        lastShareRank: new Date(),
      });
      await this.shareRepository.save(newShare);
    } else {
      share.lastShareRank = new Date();
      await this.shareRepository.save(share);
    }

    return await this.ticketService.changeTicketCount(
      userId,
      1,
      '랭킹 공유로 응모권 1장 획득',
    );
  }

  // TODO: 캐싱
  async getBetParticipants(): Promise<ParticipantsResponseDto> {
    const totalUserCounts = await this.userRepository.count({
      where: { phoneNumber: Not(IsNull()) },
    });

    const korea = await this.userRepository.count({
      where: { phoneNumber: Not(IsNull()), university: University.Korea },
    });

    const result: ParticipantsResponseDto = {
      korea,
      yonsei: totalUserCounts - korea,
    };

    return result;
  }

  async inputAnswer(
    inputAnswerDto: InputAnswerDto,
    transactionManager: EntityManager,
  ): Promise<void> {
    const { match, answers, adminCode } = inputAnswerDto;
    if (adminCode !== process.env.ADMINCODE) {
      throw new BadRequestException('Only admin can input answer!');
    }

    const questions = await transactionManager.find(BetQuestionEntity, {
      where: { match },
      order: { index: 'ASC' },
    });

    for (let i = 0; i < 5; i++) {
      if (questions[i].realAnswer !== -1)
        throw new BadRequestException('Already answers inputed!');
      if (answers[i] >= questions[i].choice.length || answers[i] < 0)
        throw new BadRequestException(`Question #${i + 1} Answer is not valid`);
      questions[i].realAnswer = answers[i];
      await transactionManager.save(questions[i]);

      const correctAnswers = await transactionManager.find(BetAnswerEntity, {
        where: {
          question: {
            id: questions[i].id,
          },
          answer: answers[i],
        },
        relations: {
          user: {
            answerCount: true,
          },
        },
      });
      for (const correctAnswer of correctAnswers) {
        correctAnswer.user.answerCount.count += 1;
        await transactionManager.save(correctAnswer.user.answerCount);
        await this.ticketService.changeTicketCount(
          correctAnswer.user.id,
          5,
          `${MatchMap[questions[i].match]} 종목 ${
            questions[i].index
          }번 예측 성공으로 응모권 5개 획득`,
          transactionManager,
        );
      }
    }

    //save rank
    const answerCounts = await transactionManager.find(AnswerCountEntity, {
      relations: {
        user: true,
      },
      order: {
        count: 'DESC',
        id: 'ASC',
      },
    });

    let sameRanking = 1;
    answerCounts.forEach((answerCount, idx, array) => {
      if (idx === 0) {
        answerCount.rank = 1;
      } else {
        if (answerCount.count === array[idx - 1].count) {
          answerCount.rank = array[idx - 1].rank;
          sameRanking++;
        } else {
          answerCount.rank = array[idx - 1].rank + sameRanking;
          sameRanking = 1;
        }
      }
    });

    await transactionManager.save(answerCounts);
  }

  async getRankList(page: number) {
    const take = 10;
    const answers = await this.answerCountRepository.find({
      relations: {
        user: true,
      },
      order: {
        rank: 'ASC',
        id: 'ASC',
      },
      take: take,
      skip: (page - 1) * take,
    });

    if (answers.length === 0) return [];

    const questionCount = await this.getAnswerdQuestionCount();

    const result = answers.map((answer) => {
      const resultDto: GetRankDto = {
        rank: answer.rank,
        correctAnswerPercentage: (answer.count / questionCount) * 100,
        name: answer.user.name,
        university: answer.user.university,
      };

      return resultDto;
    });

    return result;
  }

  async getRankById(userId: string) {
    const answerCount = await this.answerCountRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: { user: true },
    });
    const count = await this.answerCountRepository.count({
      where: {
        count: MoreThan(answerCount.count),
      },
    });

    const questionCount = await this.getAnswerdQuestionCount();

    const result: GetRankDto = {
      rank: count + 1,
      correctAnswerPercentage: (answerCount.count / questionCount) * 100,
      name: answerCount.user.name,
      university: answerCount.user.university,
    };

    return result;
  }

  async getAnswerdQuestionCount(): Promise<number> {
    //Todo - caching
    return await this.betQuestionRepository.count({
      where: {
        realAnswer: Not(-1),
      },
    });
  }

  async getLastRank(transactionManager: EntityManager): Promise<number> {
    const lastRank = await transactionManager.maximum(
      AnswerCountEntity,
      'rank',
    );
    if (lastRank === null) return 1;
    const lastRankCounts = await transactionManager.find(AnswerCountEntity, {
      where: {
        rank: lastRank,
      },
    });
    return lastRankCounts[0].count === 0
      ? lastRank
      : lastRank + lastRankCounts.length;
  }
}
