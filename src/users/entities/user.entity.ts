import { AttendanceCheckEntity } from 'src/attendance-check/entities/attendance-check.entity';
import { AnswerCountEntity } from 'src/bets/entities/answerCount.entity';
import { BetAnswerEntity } from 'src/bets/entities/betAnswer.entity';
import { ShareEntity } from 'src/bets/entities/Share.entity';
import { University } from 'src/common/enums/university.enum';
import { DrawEntity } from 'src/ticket/entities/draw.entity';
import { HistoryEntity } from 'src/ticket/entities/history.entity';
import { TicketEntity } from 'src/ticket/entities/ticket.entity';
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

  @Column({ nullable: true, length: 10 })
  name?: string;

  @Column({ name: 'phone_no', nullable: true, length: 11 })
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

  @Column('varchar')
  inviteCode: string;

  @OneToMany(() => BetAnswerEntity, (bet) => bet.user) // one to many BetDetail
  bets: BetAnswerEntity[];

  @OneToOne(() => TicketEntity, { cascade: ['update'] }) // one to many point
  @JoinColumn({ name: 'ticket_id' })
  ticket: TicketEntity;

  @OneToMany(() => HistoryEntity, (history) => history.user)
  ticketHistories: HistoryEntity[];

  @OneToMany(() => DrawEntity, (draw) => draw.user)
  draws: DrawEntity[];
  // one to many draw

  @OneToOne(() => ShareEntity, { cascade: ['update'] }) // one to many point
  @JoinColumn({ name: 'share_id' })
  Share: ShareEntity;

  @OneToMany(
    () => AttendanceCheckEntity,
    (attendanceCheck) => attendanceCheck.user,
  )
  attendanceChecks: AttendanceCheckEntity[];

  @OneToOne(() => AnswerCountEntity, { cascade: ['update'] }) // one to many point
  @JoinColumn({ name: 'answer_count_id' })
  answerCount: AnswerCountEntity;
}
