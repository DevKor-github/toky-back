import { Usage } from 'src/common/enums/usage.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('history') // usages? point_hisotry?
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Usage })
  usage: Usage;

  @Column({ name: 'used_point' })
  usedPoint: number;
  //many to one user

  @ManyToOne((type) => UserEntity, (user) => user.pointHistories)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
