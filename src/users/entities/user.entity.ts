import { BetAnswerEntity } from 'src/bets/entities/betAnswer.entity';
import { University } from 'src/common/enums/university.enum';
import { DrawEntity } from 'src/points/entities/draw.entity';
import { HistoryEntity } from 'src/points/entities/history.entity';
import { PointEntity } from 'src/points/entities/point.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true, length: 20 })
  name?: string;

  @Column({ name: 'phone_no', nullable: true, length: 12 })
  phoneNumber?: string;

  @Column({
    type: 'enum',
    enum: University,
    nullable: true,
  })
  university?: University;

  @Column({
    type: Date,
    nullable: true,
    default: null,
  })
  lastShareRank?: Date;

  @Column({
    type: Date,
    nullable: true,
    default: null,
  })
  lastSharePrediction?: Date;

  @OneToMany((type) => BetAnswerEntity, (bet) => bet.user) // one to many BetDetail
  bets: BetAnswerEntity[];

  @OneToOne((type) => PointEntity, { cascade: ['update'] }) // one to many point
  @JoinColumn({ name: 'point_id' })
  point: PointEntity;

  @OneToMany((type) => HistoryEntity, (history) => history.user)
  pointHistories: HistoryEntity[];

  @OneToMany((type) => DrawEntity, (draw) => draw.user)
  draws: DrawEntity[];
  // one to many draw
}
