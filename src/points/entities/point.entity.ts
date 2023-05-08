import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('point')
export class PointEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'remaining_point' })
  remainingPoint: number;

  @Column()
  baseball: number;

  @Column()
  basketball: number;

  @Column()
  icehockey: number;

  @Column()
  rugby: number;

  @Column()
  football: number;

  // @OneToOne()
  //ranking은? user랑 join 해서 각 항목 별로 정렬
}
