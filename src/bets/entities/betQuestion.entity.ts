import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BetAnswerEntity } from './betAnswer.entity';
import { Match } from 'src/common/enums/event.enum';
@Entity('bet_question')
export class BetQuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Match })
  match: Match;

  @Column()
  description: string;

  @Column({ type: 'text', array: true })
  choice: string[];

  @Column({ type: 'float', default: 1 })
  choice1Percentage: number;

  @Column({ type: 'float', default: 0 })
  choice2Percentage: number;

  @Column({ type: 'float', default: 0, nullable: true })
  choice3Percentage: number;

  @Column({ default: 0 })
  answerCount: number;

  @OneToMany((type) => BetAnswerEntity, (answer) => answer.question)
  betAnswers: BetAnswerEntity[];
  //one to many bet pick
}
