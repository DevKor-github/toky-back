import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { BetAnswerEntity } from './entities/betAnswer.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateBetAnswerDto } from './dto/create-bet-answer.dto';
import { BetQuestionEntity } from './entities/betQuestion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantsResponseDto } from './dto/participantsResponse.dto';
import { University } from 'src/common/enums/university.enum';
import { betQuestionResponseDto } from './dto/betQuestionResponse.dto';
import { MatchMap } from 'src/common/enums/event.enum';
import { TicketService } from 'src/ticket/ticket.service';
@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(BetAnswerEntity)
    private readonly betAnswerRepository: Repository<BetAnswerEntity>,
    @InjectRepository(BetQuestionEntity)
    private readonly betQuestionRepository: Repository<BetQuestionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly ticketService: TicketService,
    private readonly dataSource: DataSource,
  ) {}

  async getBetInfo(id: string): Promise<betQuestionResponseDto[]> {
    const betQuestions = await this.betQuestionRepository.find({
      order: {
        id: 'ASC',
      },
    });
    const betAnswers = await this.betAnswerRepository.find({
      where: {
        user: { id },
      },
      relations: { question: true },
    });

    const result: betQuestionResponseDto[] = betQuestions.map((betQuestion) => {
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
      return {
        questionId: betQuestion.id,
        description: betQuestion.description,
        choices: betQuestion.choice,
        answer: betAnswers.find(
          (answer) => answer.question.id === betQuestion.id,
        )?.answer,
        percentage,
      };
    });

    return result;
  }

  async createOrUpdateAnswer(userId: string, createDto: CreateBetAnswerDto) {
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
          `${MatchMap[`${parseInt(((questionId - 1) / 5).toString())}`]} 종목 ${
            questionId % 5 === 0 ? 5 : questionId % 5
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

  async getTotalPredictions(userId: string) {
    const questionId = [1, 6, 11, 16, 21]; //승부에 대한 예측 question id 5개 설정

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
    betAnswer.forEach((betAnswer: BetAnswerEntity) => {
      if (betAnswer.answer == 0) numWinKorea++;
      else if (betAnswer.answer == 1) numDraw++;
      else numWinYonsei++;
    });

    return { numWinKorea, numWinYonsei, numDraw };
  }

  // TODO: 캐싱
  async getBetParticipants(): Promise<ParticipantsResponseDto> {
    const totalUserCounts = await this.userRepository.count({
      where: { phoneNumber: Not(IsNull()) },
    });

    const korea = await this.userRepository.count({
      where: { phoneNumber: Not(IsNull()), university: University.Korea },
    });

    return { korea, yonsei: totalUserCounts - korea };
  }
}
