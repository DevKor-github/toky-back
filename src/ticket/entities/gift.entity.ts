import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DrawEntity } from './draw.entity';

@Entity('gift')
export class GiftEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'required_ticket' })
  requiredTicket: number;

  @Column({ name: 'photo_url' })
  photoUrl: string;

  @OneToMany(() => DrawEntity, (draw) => draw.gift)
  draws: DrawEntity[];
}
