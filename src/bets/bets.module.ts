import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetAnswerEntity } from './entities/betAnswer.entity';
import { BetQuestionEntity } from './entities/betQuestion.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { TicketModule } from 'src/ticket/ticket.module';
import { AnswerCountEntity } from './entities/answerCount.entity';
import { ShareEntity } from './entities/Share.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BetAnswerEntity,
      BetQuestionEntity,
      UserEntity,
      ShareEntity,
      AnswerCountEntity,
    ]),
    TicketModule,
  ],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule {}
