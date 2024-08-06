import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('attendance_check')
export class AttendanceCheckEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  attendanceDate: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_answer_correct',
  })
  isAnswerCorrect: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
