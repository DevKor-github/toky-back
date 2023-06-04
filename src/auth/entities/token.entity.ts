import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('token')
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'refresh_token' })
  refreshToken: string;

  @ManyToOne((type) => UserEntity, (user) => undefined)
  user: UserEntity;
}
