import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDetailEntity } from './entities/betDetail.entity';
import { BetQuestionEntity } from './entities/betQuestion.entity';

@Module({
  imports : [TypeOrmModule.forFeature([BetDetailEntity,BetQuestionEntity])],
  controllers: [BetsController],
  providers: [BetsService]
})
export class BetsModule {}
