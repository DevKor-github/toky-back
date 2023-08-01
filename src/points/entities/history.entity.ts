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

  @Column({ name: 'used_point' })
  usedPoint: number;
  //many to one user
  @Column({ name: 'remained_point' })
  remainedPoint: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => UserEntity, (user) => user.pointHistories)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
