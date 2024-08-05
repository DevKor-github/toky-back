import { Module } from '@nestjs/common';
import { AttendanceCheckController } from './attendance-check.controller';
import { AttendanceCheckService } from './attendance-check.service';

@Module({
  controllers: [AttendanceCheckController],
  providers: [AttendanceCheckService]
})
export class AttendanceCheckModule {}
