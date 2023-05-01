import { type } from "os";
import { BetDetailEntity } from "src/bets/entities/betDetail.entity";
import { DrawEntity } from "src/points/entities/draw.entity";
import { HistoryEntity } from "src/points/entities/history.entity";
import { PointEntity } from "src/points/entities/point.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity{
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    name: string;

    @Column({name: 'phone_no'})
    phoneNumber: string;
    
    @Column()
    university : string; 

    @OneToMany(type => BetDetailEntity, bet=> bet.user) // one to many BetDetail
    bets: BetDetailEntity[];

    @OneToOne(type => PointEntity) // one to many point
    @JoinColumn()
    point : PointEntity;
    
    @OneToOne(type => HistoryEntity)
    @JoinColumn()
    pointHistory : HistoryEntity;

    @OneToMany(type => DrawEntity, draw => draw.user)
    draws : DrawEntity[];
    // one to many draw
}