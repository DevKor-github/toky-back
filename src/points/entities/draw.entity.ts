import { UserEntity } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GiftEntity } from "./gift.entity";

@Entity('draw')
export class DrawEntity{
    // many to one user
    // many to one gift
    @PrimaryGeneratedColumn()
    id : number;

    @ManyToOne(type => UserEntity, user=>user.draws)
    @JoinColumn()
    user : UserEntity;

    @ManyToOne(type => GiftEntity, gift => gift.draws)
    @JoinColumn()
    gift : GiftEntity;
    // 날짜?
}