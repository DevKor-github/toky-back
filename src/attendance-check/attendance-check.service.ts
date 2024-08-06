import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceCheckEntity } from './entities/attendance-check.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  AttendanceCheckQuizRequestDto,
  AttendanceCheckQuizResponseDto,
} from './dto/attendance-check-quiz';
import { AttendanceCheckQuizEntity } from './entities/attendance-check-quiz.entity';
import { TicketService } from 'src/ticket/ticket.service';

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
    attendanceCheckQuizRequestDto: AttendanceCheckQuizRequestDto,
  ): Promise<AttendanceCheckQuizResponseDto> {
    // 이미 출석체크를 했는지 확인
    const isAlreadyAttended = await transactionManager.findOne(
      AttendanceCheckEntity,
      {
        where: {
          user: { id: userId },
          attendanceDate: attendanceCheckQuizRequestDto.attendanceDate,
        },
      },
    );

    if (isAlreadyAttended) {
      throw new BadRequestException('Already attended');
    }

    const attendance = transactionManager.create(AttendanceCheckEntity, {
      attendanceDate: attendanceCheckQuizRequestDto.attendanceDate,
      user: { id: userId },
    });

    const todayQuiz = await transactionManager.findOne(
      AttendanceCheckQuizEntity,
      {
        where: {
          attendanceDate: attendanceCheckQuizRequestDto.attendanceDate,
        },
      },
    );

    // 오늘 퀴즈와 사용자가 제출한 답이 일치하는지 확인
    if (todayQuiz.answer === attendanceCheckQuizRequestDto.answer) {
      attendance.isAnswerCorrect = true;
      await this.ticketService.changeTicketCount(
        userId,
        2,
        'Right Answer!',
        transactionManager,
      );
    } else {
      await this.ticketService.changeTicketCount(
        userId,
        1,
        'Wrong Answer!',
        transactionManager,
      );
    }
    await transactionManager.save(attendance);
    return {
      userId,
      attendanceDate: todayQuiz.attendanceDate,
      correct: attendance.isAnswerCorrect,
    };
  }
}
