import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('answer_count')
export class AnswerCountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'count', default: 0 })
  count: number;

  @OneToOne(() => UserEntity, { onUpdate: 'CASCADE' }) // one to many point
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
