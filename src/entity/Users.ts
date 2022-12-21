import { Entity, PrimaryGeneratedColumn, Unique, Column, CreateDateColumn, ManyToMany, UpdateDateColumn } from 'typeorm';
import { MinLength, IsNotEmpty, IsEmail } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Arduino } from './Arduino';
import { Tarea } from './Tareas';

@Entity()
@Unique(['username'])
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({default: 'user'})
  @MinLength(1)
  name: string;

  @Column()
  @MinLength(6)
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @Column()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @Column()
  @IsNotEmpty()
  role: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  hashPassword(): void {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt); 
  }

  checkPassword = async (password:string) =>{
    try { 
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.log(error);
    }
  }

  @ManyToMany(() => Arduino,(arduino)=>arduino.id_user)
    id_arduino: Arduino[];

  @ManyToMany(() => Tarea,(tarea)=>tarea.id_user)
  id_tarea: Tarea[];
}
