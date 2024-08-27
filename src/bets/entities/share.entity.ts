import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('share')
export class ShareEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: Date,
    default: null,
  })
  lastSharePrediction: Date;

  @Column({
    type: Date,
    default: null,
  })
  lastShareRank: Date;

  @OneToOne(() => UserEntity, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
