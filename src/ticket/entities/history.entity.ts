import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('history') // usages? point_hisotry?
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  @Column({ name: 'used_ticket' })
  usedTicket: number;
  //many to one user
  @Column({ name: 'remaining_ticket' })
  remainingTicket: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.ticketHistories)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
