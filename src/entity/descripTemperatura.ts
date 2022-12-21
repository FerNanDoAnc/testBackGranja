import { IsNotEmpty } from "class-validator";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Arduino } from './Arduino';

@Entity()

export class descripTemperatura {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    encenderTempc: number;

    @Column({default:1})
    @IsNotEmpty()
    estado: number;
    
    @OneToOne(()=> Arduino, (arduino)=> arduino.id_descripTemp)
    @JoinColumn()
    id_arduino: Arduino;
}
