import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BetQuestionEntity } from './betQuestion.entity';

@Entity('bet_answer')
export class BetAnswerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  answer: number; //enum choice가 매 question마다 개수가 다를 수 있음

  @ManyToOne(() => UserEntity, (user) => user.bets) //fk  many to one user
  @JoinColumn({ name: 'user_id' }) //
  user: UserEntity;

  @ManyToOne(() => BetQuestionEntity, (question) => question.betAnswers) //many to one bet item
  @JoinColumn({ name: 'question_id' })
  question: BetQuestionEntity;
}
