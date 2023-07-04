import { UserEntity } from 'src/users/entities/user.entity';
import { University } from 'src/common/enums/university.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cheer')
export class CheerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: University, default: University.Korea })
  univ: University;

  @OneToOne(() => UserEntity, () => undefined)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
