import { UserEntity } from 'src/users/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GiftEntity } from './gift.entity';

@Entity('draw')
export class DrawEntity {
  // many to one user
  // many to one gift
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.draws)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => GiftEntity, (gift) => gift.draws)
  @JoinColumn({ name: 'gift_id' })
  gift: GiftEntity;
  // 날짜?
}
