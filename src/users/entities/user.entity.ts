import { AttendanceCheckEntity } from 'src/attendance-check/entities/attendance-check.entity';
import { BetAnswerEntity } from 'src/bets/entities/betAnswer.entity';
import { BetShareEntity } from 'src/bets/entities/betShare.entity';
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

  @Column({ nullable: true, length: 20 })
  name?: string;

  @Column({ name: 'phone_no', nullable: true, length: 14 })
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

  @OneToOne(() => BetShareEntity, { cascade: ['update'] }) // one to many point
  @JoinColumn({ name: 'bet_share_id' })
  betShare: BetShareEntity;

  @OneToMany(
    () => AttendanceCheckEntity,
    (attendanceCheck) => attendanceCheck.user,
  )
  attendanceChecks: AttendanceCheckEntity[];
}
