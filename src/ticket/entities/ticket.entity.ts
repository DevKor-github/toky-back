import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ticket')
export class TicketEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'count' })
  count: number;

  @OneToOne(() => UserEntity, { onUpdate: 'CASCADE' }) // one to many point
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
