import { Injectable, NotFoundException } from '@nestjs/common';
import { In, IsNull, Not, Repository } from 'typeorm';
import { BetAnswerEntity } from './entities/betAnswer.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateBetAnswerDto } from './dto/create-bet-answer.dto';
import { BetQuestionEntity } from './entities/betQuestion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantsResponseDto } from './dto/participantsResponse.dto';
import { University } from 'src/common/enums/university.enum';
import { betQuestionResponseDto } from './dto/betQuestionResponse.dto';
import { PointEntity } from 'src/points/entities/point.entity';
import { HistoryEntity } from 'src/points/entities/history.entity';
import { MatchMap } from 'src/common/enums/event.enum';
@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(BetAnswerEntity)
    private readonly betAnswerRepository: Repository<BetAnswerEntity>,
    @InjectRepository(BetQuestionEntity)
    private readonly betQuestionRepository: Repository<BetQuestionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PointEntity)
    private readonly pointRepository: Repository<PointEntity>,
    @InjectRepository(HistoryEntity)
    private readonly historyRepository: Repository<HistoryEntity>,
  ) {}

  async getBetInfo(id: string): Promise<betQuestionResponseDto[]> {
    const betQuestions = await this.betQuestionRepository.find();
    const betAnswers = await this.betAnswerRepository.find({
      where: {
        user: { id },
      },
      relations: { question: true },
    });

    const result: betQuestionResponseDto[] = betQuestions.map((betQuestion) => {
      return {
        questionId: betQuestion.id,
        description: betQuestion.description,
        choices: betQuestion.choice,
        answer: betAnswers.find(
          (answer) => answer.question.id === betQuestion.id,
        )?.answer,
        percentage: [
          betQuestion.choice1Percentage,
          betQuestion.choice2Percentage,
          betQuestion.choice3Percentage,
        ].filter((percentage) => percentage !== null),
      };
    });

    return result;
  }

  async createOrUpdateAnswer(userid: string, createDto: CreateBetAnswerDto) {
    const { questionId, answer } = createDto;

    if (questionId < 1 || questionId > 25) {
      throw new NotFoundException(
        'An betting question with requested questionId does not exist',
      );
    }

    const existingAnswer = await this.betAnswerRepository.findOne({
      where: {
        user: { id: userid },
        question: { id: questionId },
      },
      relations: ['question'],
    });
    if (existingAnswer) {
      if (answer >= existingAnswer.question.choice.length || answer < 0)
        throw new NotFoundException('Answer is not valid');
      const prevAnswer = existingAnswer.answer;
      existingAnswer.answer = answer;
      await this.betAnswerRepository.save(existingAnswer);

      const count = existingAnswer.question.answerCount;
      const n1 = existingAnswer.question.choice1Percentage * count;
      const n2 = existingAnswer.question.choice2Percentage * count;
      if (existingAnswer.question.choice.length == 3) {
        const n3 = existingAnswer.question.choice3Percentage * count;

        switch (prevAnswer) {
          case 0:
            existingAnswer.question.choice1Percentage = (n1 - 1) / count;
            break;
          case 1:
            existingAnswer.question.choice2Percentage = (n2 - 1) / count;
            break;
          case 2:
            existingAnswer.question.choice3Percentage = (n3 - 1) / count;
            break;
        }

        switch (answer) {
          case 0:
            existingAnswer.question.choice1Percentage = (n1 + 1) / count;
            break;
          case 1:
            existingAnswer.question.choice2Percentage = (n2 + 1) / count;
            break;
          case 2:
            existingAnswer.question.choice3Percentage = (n3 + 1) / count;
        }
      } else {
        switch (prevAnswer) {
          case 0:
            existingAnswer.question.choice1Percentage = (n1 - 1) / count;
            break;
          case 1:
            existingAnswer.question.choice2Percentage = (n2 - 1) / count;
            break;
        }

        switch (answer) {
          case 0:
            existingAnswer.question.choice1Percentage = (n1 + 1) / count;
            break;
          case 1:
            existingAnswer.question.choice2Percentage = (n2 + 1) / count;
            break;
        }
      }
      await this.betQuestionRepository.save(existingAnswer.question);
      return {
        status: 200,
        percentage: [
          existingAnswer.question.choice1Percentage,
          existingAnswer.question.choice2Percentage,
          existingAnswer.question.choice3Percentage,
        ],
      };
    } else {
      const newAnswer = this.betAnswerRepository.create({
        user: { id: userid },
        question: { id: questionId },
        answer,
      });
      await this.betAnswerRepository.save(newAnswer);
      const question = await this.betQuestionRepository.findOne({
        where: {
          id: questionId,
        },
      });
      const count = question.answerCount;
      const n1 = question.choice1Percentage * count;
      const n2 = question.choice2Percentage * count;
      if (question.choice.length == 3) {
        const n3 = question.choice3Percentage * count;
        if (answer == 0) {
          question.choice1Percentage = (n1 + 1) / (count + 1);
          question.choice2Percentage = n2 / (count + 1);
          question.choice3Percentage = n3 / (count + 1);
        } else if (answer == 1) {
          question.choice1Percentage = n1 / (count + 1);
          question.choice2Percentage = (n2 + 1) / (count + 1);
          question.choice3Percentage = n3 / (count + 1);
        } else {
          question.choice1Percentage = n1 / (count + 1);
          question.choice2Percentage = n2 / (count + 1);
          question.choice3Percentage = (n3 + 1) / (count + 1);
        }
      } else {
        if (answer == 0) {
          question.choice1Percentage = (n1 + 1) / (count + 1);
          question.choice2Percentage = n2 / (count + 1);
        } else {
          question.choice1Percentage = n1 / (count + 1);
          question.choice2Percentage = (n2 + 1) / (count + 1);
        }
      }
      question.answerCount = count + 1;
      await this.betQuestionRepository.save(question);

      const user = await this.userRepository.findOne({
        where: { id: userid },
        relations: ['point'],
      });
      user.point.totalPoint += 10;
      user.point.remainingPoint += 10;
      await this.pointRepository.save(user.point);

      const history = this.historyRepository.create({
        user: { id: userid },

        detail: `${
          MatchMap[`${parseInt(((questionId - 1) / 5).toString())}`]
        } 종목 ${(questionId % 5) + 1}번 예측 참여로 10포인트 획득하였습니다.`,
        usedPoint: 10,
      });
      await this.historyRepository.save(history);

      return {
        status: 201,
        percentage: [
          question.choice1Percentage,
          question.choice2Percentage,
          question.choice3Percentage,
        ],
      };
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
