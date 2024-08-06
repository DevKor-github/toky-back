import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attendance_check_quiz')
export class AttendanceCheckQuizEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  attendanceDate: string;

  @Column({ nullable: false })
  answewr: string;
}
