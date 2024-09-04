import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceCheckEntity } from './entities/attendance-check.entity';
import { EntityManager, Repository } from 'typeorm';
import {
  SubmitAttendanceCheckQuizRequestDto,
  SubmitAttendanceCheckQuizResponseDto,
} from './dto/submit-attendance-check-quiz.dto';
import { AttendanceCheckQuizEntity } from './entities/attendance-check-quiz.entity';
import { TicketService } from 'src/ticket/ticket.service';
import {
  GetAttendanceCheckQuizAndMyAttendanceResponseDto,
  GetMyAttendanceResponseDto,
} from './dto/get-attendance-check-quiz-and-my-attendance.dto';

@Injectable()
export class AttendanceCheckService {
  constructor(
    @InjectRepository(AttendanceCheckEntity)
    private readonly attendanceCheckRepository: Repository<AttendanceCheckEntity>,
    @InjectRepository(AttendanceCheckQuizEntity)
    private readonly attendanceCheckQuizRepository: Repository<AttendanceCheckQuizEntity>,
    private readonly ticketService: TicketService,
  ) {}

  async submitAttendanceCheckQuiz(
    transactionManager: EntityManager,
    userId: string,
    submitAttendanceCheckQuizRequestDto: SubmitAttendanceCheckQuizRequestDto,
  ): Promise<SubmitAttendanceCheckQuizResponseDto> {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨트 값
    const koreaTime = new Date(Date.now() + offset);
    const koreaToday = koreaTime.toISOString().split('T')[0];

    // 이미 출석체크를 했는지 확인
    const isAlreadyAttended = await transactionManager.findOne(
      AttendanceCheckEntity,
      {
        where: {
          user: { id: userId },
          attendanceDate: koreaToday,
        },
      },
    );

    if (isAlreadyAttended) {
      throw new ForbiddenException('Already attended');
    }

    const attendance = transactionManager.create(AttendanceCheckEntity, {
      attendanceDate: koreaToday,
      user: { id: userId },
    });

    const todayQuiz = await transactionManager.findOne(
      AttendanceCheckQuizEntity,
      {
        where: {
          attendanceDate: koreaToday,
        },
      },
    );

    if (!todayQuiz) {
      throw new ForbiddenException('No quiz today!');
    }

    // 오늘 퀴즈와 사용자가 제출한 답이 일치하는지 확인
    if (todayQuiz.answer === submitAttendanceCheckQuizRequestDto.answer) {
      attendance.isAnswerCorrect = true;
      await this.ticketService.changeTicketCount(
        userId,
        2,
        '출석퀴즈 정답!',
        transactionManager,
      );
    } else {
      await this.ticketService.changeTicketCount(
        userId,
        1,
        '출석퀴즈 참여!',
        transactionManager,
      );
    }
    await transactionManager.save(attendance);
    return new SubmitAttendanceCheckQuizResponseDto(
      attendance.attendanceDate,
      attendance.isAnswerCorrect,
    );
  }

  async getAttendanceCheckQuizAndMyAttendance(
    userId: string,
  ): Promise<GetAttendanceCheckQuizAndMyAttendanceResponseDto> {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨트 값
    const koreaTime = new Date(Date.now() + offset);
    const koreaToday = koreaTime.toISOString().split('T')[0];

    const todayQuiz = await this.attendanceCheckQuizRepository.findOne({
      where: { attendanceDate: koreaToday },
    });

    const myAttendance = await this.attendanceCheckRepository.find({
      where: { user: { id: userId } },
    });

    const myTodayAttendance = await this.attendanceCheckRepository.findOne({
      where: { user: { id: userId }, attendanceDate: koreaToday },
    });

    const myAttendanceHistory = myAttendance.map(
      (attendance) => new GetMyAttendanceResponseDto(attendance),
    );

    return new GetAttendanceCheckQuizAndMyAttendanceResponseDto(
      myAttendanceHistory,
      koreaToday,
      todayQuiz ? todayQuiz.id : null,
      todayQuiz ? todayQuiz.description : null,
      myTodayAttendance ? true : false,
      myTodayAttendance ? myTodayAttendance.isAnswerCorrect : null,
      myTodayAttendance ? todayQuiz.answer : null,
    );
  }
}
