import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('bet_share')
export class BetShareEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: Date,
  })
  lastSharePrediction: Date;

  @OneToOne(() => UserEntity, { onUpdate: 'CASCADE' }) // one to many point
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
