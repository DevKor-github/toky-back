import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attendance_check_quiz')
export class AttendanceCheckQuizEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  attendanceDate: string;

  @Column()
  answer: boolean;
}
