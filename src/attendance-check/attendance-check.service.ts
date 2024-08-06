import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceCheckEntity } from './entities/attendance-check.entity';
import { DataSource, Repository } from 'typeorm';
import {
  AttendanceCheckQuizRequestDto,
  AttendanceCheckQuizResponseDto,
} from './dto/attendance-check-quiz';

@Injectable()
export class AttendanceCheckService {
  constructor(
    @InjectRepository(AttendanceCheckEntity)
    private readonly attendanceCheckRepository: Repository<AttendanceCheckEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async submitAttendanceCheckQuiz(
    userId: string,
    attendanceCheckQuizRequestDto: AttendanceCheckQuizRequestDto,
  ): Promise<any> {
    
  }
}
