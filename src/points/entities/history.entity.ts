import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('history')// usages? point_hisotry?
export class HistoryEntity{

    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    usage: string; // enum? -- 베팅이면 1 응모면 2

    @Column({name:'used_point'})
    usedPoint : number;
    //many to one user
}