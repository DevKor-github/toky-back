import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetAnswerEntity } from './entities/betAnswer.entity';
import { BetQuestionEntity } from './entities/betQuestion.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { PointEntity } from 'src/points/entities/point.entity';
import { HistoryEntity } from 'src/points/entities/history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BetAnswerEntity,
      BetQuestionEntity,
      UserEntity,
      PointEntity,
      HistoryEntity,
    ]),
  ],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule {}
