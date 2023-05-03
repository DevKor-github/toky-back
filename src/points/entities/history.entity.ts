import { Usage } from "src/common/enums/usage.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('history')// usages? point_hisotry?
export class HistoryEntity{

    @PrimaryGeneratedColumn()
    id : number;

    @Column({type:'enum', enum: Usage})
    usage: Usage;

    @Column({name:'used_point'})
    usedPoint : number;
    //many to one user
}