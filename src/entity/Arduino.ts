// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } = require('typeorm');
import { MinLength, IsNotEmpty } from 'class-validator';
import {Users} from '../entity/Users';
import { Tarea } from './Tareas';
import { descripTemperatura } from './descripTemperatura';
import { descripArdTarea } from './descripArdTarea';

@Entity(
    {name: 'arduino'} 
)
export class Arduino {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @MinLength(1)  
    nombre: string;

    @Column()
    @MinLength(1)  
    nombre_opc: string;

    @Column()
    @IsNotEmpty()
    opc: number;

    @Column()
    @IsNotEmpty()
    encendido: boolean;

    @Column()
    @MinLength(1)  
    img: string;

    @Column()
    @IsNotEmpty()
    estado: number;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    // Usuarios
    @ManyToMany(() => Users,(user)=>user.id_arduino, {  
        cascade: true 
    })
    @JoinTable({
        name: 'arduinos_user',
        joinColumn: { name: 'arduino_id'},
        inverseJoinColumn: { name: 'user_id'}
    })
    id_user: Users[];
    
    // Tareas
    @ManyToMany(() => Tarea,(tarea)=>tarea.id_arduino)
    id_tarea: Tarea[];

    // DescripTemperatura
    @OneToOne(() => descripTemperatura, (descripTemp) => descripTemp.id_arduino)
    id_descripTemp: descripTemperatura
 

    // DescripTemperatura
    @ManyToOne(() => descripArdTarea, (descripardTarea) => descripardTarea.id_arduino)
    id_descripArdTarea: descripArdTarea
} 
