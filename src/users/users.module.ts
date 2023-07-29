import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PhoneEntity } from 'src/auth/entities/phone.entity';
import { PointEntity } from 'src/points/entities/point.entity';
import { HistoryEntity } from 'src/points/entities/history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PhoneEntity,
      PointEntity,
      HistoryEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
