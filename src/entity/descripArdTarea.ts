import { IsNotEmpty } from "class-validator";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Arduino } from './Arduino';

@Entity()

export class descripArdTarea {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal', precision: 5, scale: 1, default: 0, }) 
    litros: number

    @Column({ type: 'decimal', precision: 5, scale: 1, default: 0, }) 
    kilos: number

    @Column({default:1})
    @IsNotEmpty()
    estado: number;

    @OneToMany(() => Arduino, (arduino) => arduino.id_descripArdTarea)
    id_arduino: Arduino[];
}
