import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('token')
export class PhoneEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'is_valid' })
  isValid: boolean;

  @Column({ name: 'code' })
  code: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne((type) => UserEntity, (user) => undefined)
  user: UserEntity;
}
