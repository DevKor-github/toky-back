import { type } from "os";
import { BetAnswerEntity } from "src/bets/entities/betAnswer.entity";
import { University } from "src/common/enums/university.enum";
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
    
    @Column({type : 'enum', enum: University, default: University.Korea})
    university : University; 

    @OneToMany(type => BetAnswerEntity, bet=> bet.user) // one to many BetDetail
    bets: BetAnswerEntity[];

    @OneToOne(type => PointEntity) // one to many point
    @JoinColumn({name : 'point_id'})
    point : PointEntity;
    
    @OneToOne(type => HistoryEntity)
    @JoinColumn({name: 'point_history_id'})
    pointHistory : HistoryEntity;

    @OneToMany(type => DrawEntity, draw => draw.user)
    draws : DrawEntity[];
    // one to many draw
}