import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BetDetailEntity } from "./betDetail.entity";
@Entity('bet_question')
export class BetQuestionEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    event : number;

    @Column()
    description: string;

    @Column()
    result : number;

    @OneToMany(type => BetDetailEntity, detail => detail.question)
    betDetails : BetDetailEntity[];
    //one to many bet pick

}