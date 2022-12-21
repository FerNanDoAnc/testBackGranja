import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, UpdateDateColumn, Timestamp } from 'typeorm';
import { MinLength, IsNotEmpty } from 'class-validator'; 
import { Arduino } from '../entity/Arduino';
import { Users } from './Users';

@Entity(
    // {name: 'tareas'} 
)
export class Tarea {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default :0}) 
    indice: number

    @Column()
    @MinLength(1)  
    nombre: string;

    @Column()
    @IsNotEmpty()
    fecha: Date; 
    
    @Column({default: '00:00'})
    @IsNotEmpty()
    hora: string;

    @Column({ type: 'simple-array' })
    @IsNotEmpty()
    comp_arduino: string[];

    @Column({ type: 'decimal', precision: 5, scale: 1, default: 0, }) 
    litros: number

    @Column({ type: 'decimal', precision: 5, scale: 1, default: 0, }) 
    kilos: number

    @Column()
    tipo: number;

    @Column({default:1})
    @IsNotEmpty()
    estado: number;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    // Muchos a muchos con arduino
    @ManyToMany(() => Arduino,(arduino)=>arduino.id_tarea, {  
        cascade: true 
    })
    @JoinTable({
        name: 'tareas_arduinos',
        joinColumn: { name: 'tarea_id'},
        inverseJoinColumn: { name: 'arduino_id'}
    })
    id_arduino: Arduino[]; 

    // Muchos a muchos con usuarios
    @ManyToMany(() => Users,(user)=>user.id_tarea, {  
        cascade: true 
    })
    @JoinTable({
        name: 'users_tareas',
        joinColumn: { name: 'tarea_id', referencedColumnName: 'id'},
        inverseJoinColumn: { name: 'usuario_id', referencedColumnName: 'id'}
    })
    id_user: Users[]; 
 
}
