import { Module } from '@nestjs/common';
import { AttendanceCheckController } from './attendance-check.controller';
import { AttendanceCheckService } from './attendance-check.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceCheckEntity } from './entities/attendance-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceCheckEntity])],
  controllers: [AttendanceCheckController],
  providers: [AttendanceCheckService],
})
export class AttendanceCheckModule {}
