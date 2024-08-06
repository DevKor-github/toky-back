import { Module } from '@nestjs/common';
import { AttendanceCheckController } from './attendance-check.controller';
import { AttendanceCheckService } from './attendance-check.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceCheckEntity } from './entities/attendance-check.entity';
import { AttendanceCheckQuizEntity } from './entities/attendance-check-quiz.entity';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceCheckEntity,
      AttendanceCheckQuizEntity,
    ]),
    TicketModule,
  ],
  controllers: [AttendanceCheckController],
  providers: [AttendanceCheckService],
})
export class AttendanceCheckModule {}
