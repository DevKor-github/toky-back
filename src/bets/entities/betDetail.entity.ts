import { UserEntity } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BetQuestionEntity } from "./betQuestion.entity";

@Entity('bet_detail')
export class BetDetailEntity{
    @PrimaryGeneratedColumn()
    id : number;

    @ManyToOne(type => UserEntity, user => user.bets) //fk  many to one user
    @JoinColumn() // 
    user : UserEntity;
   
    @ManyToOne(type => BetQuestionEntity, question => question.betDetails)//many to one bet item
    @JoinColumn()
    question : BetQuestionEntity;
    
}