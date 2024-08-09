import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceCheckEntity } from './entities/attendance-check.entity';
import { EntityManager, Repository } from 'typeorm';
import {
  SubmitAttendanceCheckQuizRequestDto,
  SubmitAttendanceCheckQuizResponseDto,
} from './dto/submit-attendance-check-quiz';
import { AttendanceCheckQuizEntity } from './entities/attendance-check-quiz.entity';
import { TicketService } from 'src/ticket/ticket.service';
import {
  GetAttendanceCheckQuizRequestDto,
  GetAttendanceCheckQuizResponseDto,
} from './dto/get-attendance-check-quiz.dto';
import { GetMyAttendanceResponseDto } from './dto/get-my-attendance.dto';

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

    if (koreaToday !== submitAttendanceCheckQuizRequestDto.attendanceDate) {
      throw new ForbiddenException('Only today is available');
    }

    // 이미 출석체크를 했는지 확인
    const isAlreadyAttended = await transactionManager.findOne(
      AttendanceCheckEntity,
      {
        where: {
          user: { id: userId },
          attendanceDate: submitAttendanceCheckQuizRequestDto.attendanceDate,
        },
      },
    );

    if (isAlreadyAttended) {
      throw new ForbiddenException('Already attended');
    }

    const attendance = transactionManager.create(AttendanceCheckEntity, {
      attendanceDate: submitAttendanceCheckQuizRequestDto.attendanceDate,
      user: { id: userId },
    });

    const todayQuiz = await transactionManager.findOne(
      AttendanceCheckQuizEntity,
      {
        where: {
          attendanceDate: submitAttendanceCheckQuizRequestDto.attendanceDate,
        },
      },
    );

    // 오늘 퀴즈와 사용자가 제출한 답이 일치하는지 확인
    if (todayQuiz.answer === submitAttendanceCheckQuizRequestDto.answer) {
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
    return new SubmitAttendanceCheckQuizResponseDto(
      userId,
      attendance.attendanceDate,
      attendance.isAnswerCorrect,
    );
  }

  async getAttendanceCheckQuiz(
    getAttendanceCheckQuizRequestDto: GetAttendanceCheckQuizRequestDto,
  ): Promise<GetAttendanceCheckQuizResponseDto> {
    const today = getAttendanceCheckQuizRequestDto.attendanceDate;
    if (!today) {
      throw new BadRequestException('Enter today date!');
    }
    const todayQuiz = await this.attendanceCheckQuizRepository.findOne({
      where: { attendanceDate: today },
    });

    if (!todayQuiz) {
      throw new NotFoundException('No quiz today!');
    }

    return new GetAttendanceCheckQuizResponseDto(
      today,
      todayQuiz.id,
      todayQuiz.description,
    );
  }

  async getMyAttendance(userId: string): Promise<GetMyAttendanceResponseDto[]> {
    const myAttendance = await this.attendanceCheckRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return myAttendance.map(
      (attendance) => new GetMyAttendanceResponseDto(attendance),
    );
  }
}