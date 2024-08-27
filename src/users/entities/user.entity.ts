import { AttendanceCheckEntity } from 'src/attendance-check/entities/attendance-check.entity';
import { AnswerCountEntity } from 'src/bets/entities/answerCount.entity';
import { BetAnswerEntity } from 'src/bets/entities/betAnswer.entity';
import { ShareEntity } from 'src/bets/entities/share.entity';
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

  @OneToMany(() => BetAnswerEntity, (bet) => bet.user)
  bets: BetAnswerEntity[];

  @OneToOne(() => TicketEntity, { cascade: ['update'] })
  @JoinColumn({ name: 'ticket_id' })
  ticket: TicketEntity;

  @OneToMany(() => HistoryEntity, (history) => history.user)
  ticketHistories: HistoryEntity[];

  @OneToMany(() => DrawEntity, (draw) => draw.user)
  draws: DrawEntity[];

  @OneToOne(() => ShareEntity, { cascade: ['update'] })
  @JoinColumn({ name: 'share_id' })
  share: ShareEntity;

  @OneToMany(
    () => AttendanceCheckEntity,
    (attendanceCheck) => attendanceCheck.user,
  )
  attendanceChecks: AttendanceCheckEntity[];

  @OneToOne(() => AnswerCountEntity, { cascade: ['update'] })
  @JoinColumn({ name: 'answer_count_id' })
  answerCount: AnswerCountEntity;
}
