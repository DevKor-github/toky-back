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
  index: number;

  @Column()
  description: string;

  @Column({ type: 'text', array: true })
  choice: string[];

  @Column({ type: 'int', default: 0 })
  choice1Count: number;

  @Column({ type: 'int', default: 0 })
  choice2Count: number;

  @Column({ type: 'int', default: 0, nullable: true })
  choice3Count: number;

  @Column({ type: 'int', default: -1 })
  realAnswer: number;

  @OneToMany(() => BetAnswerEntity, (answer) => answer.question)
  betAnswers: BetAnswerEntity[];
  //one to many bet pick
}
