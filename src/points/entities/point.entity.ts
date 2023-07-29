import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('point')
export class PointEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'remaining_point' })
  remainingPoint: number;

  @Column({ name: 'total_point' })
  totalPoint: number;
}
