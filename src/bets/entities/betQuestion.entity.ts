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

  @Column()
  result: number;

  @Column({type : "text", array: true})
  choice : string[];

  @OneToMany((type) => BetAnswerEntity, (detail) => detail.question)
  betDetails: BetAnswerEntity[];
  //one to many bet pick
}
