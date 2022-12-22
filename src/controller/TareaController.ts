
import { Request, Response } from 'express';
import { Tarea } from '../entity/Tareas'; 
import { getRepository } from 'typeorm'; 
import { validate } from 'class-validator';
import { Users } from '../entity/Users';
import { Arduino } from '../entity/Arduino';

export class TareaController{ 

    static getAll = async (req: Request, res: Response) => {  

        const tareaRepository = getRepository(Tarea);
        let tareas;

        try {
            tareas = await tareaRepository.find({relations: ["id_arduino","id_user"]});
            // tareas = await tareaRepository.find({ select: ['id', 'nombre', 'fecha', 'estado'] });
            try {
                tareas.sort(function(a, b) {
                    return a.indice - b.indice;
                });
            } catch (error) {
                console.log(error)
            }
        } catch (e) {
            res.status(404).json({ message: 'Algo salió mal' });
        }

        if (tareas.length > 0) {
            res.status(200).json({
                ok: true,
                message: 'Tareas obtenidas',
                tareas
            });
        }else{
            res.status(200).json({ message: 'No hay resultados' });
        }

    }

    static getAllStatusUno = async (req: Request, res: Response) => {  

        const tareaRepository = getRepository(Tarea);
        let tareas;

        try {
            tareas = await tareaRepository.find({
                relations: ["id_arduino","id_user"],
                where: {estado: 1}
            });
            // tareas = await tareaRepository.find({ select: ['id', 'nombre', 'fecha', 'estado'] });
            // ordenar por indice
            try {
                tareas.sort(function(a, b) {
                    return a.indice - b.indice;
                });
            } catch (error) {
                console.log(error)
            }
        } catch (e) {
            res.status(404).json({ ok:false,message: 'Algo salió mal' });
        }

        if (tareas.length > 0) {
            res.status(200).json({
                ok: true,
                message: 'Tareas obtenidas',
                tareas
            });
        }else{
            res.status(200).json({ message: 'No hay resultados' });
        }

    }
    
    static getById = async (req: Request, res: Response) => {
        const tareaRepository = getRepository(Tarea)
        let tareas;
        try {
             tareas=await tareaRepository.findOneOrFail(req.params.id,{ 
                where: {
                    estado:1
                },
                relations: ['id_arduino','id_user']
            });
            try {
                tareas.sort(function(a, b) {
                    return a.indice - b.indice;
                });
            } catch (error) {
                console.log(error)
            }
        } catch (error) {
            res.status(404).json({ message: 'No existe la tarea con ese id' });
            console.log(error)
        }
        res.send(tareas)
    }

    static new = async (req: Request, res: Response) => {
        try {
            const tareaRepository = getRepository(Tarea);
            const newTarea = tareaRepository.create(req.body);

            // Agregar arduino y usuario
            const { id_user,comp_arduino } = req.body;  
            // arduino
            const arduinoRepository = getRepository(Arduino);
            const arduinos=[]; 
            const user=[];
            for (const id_ard of comp_arduino) {
                const arduino=await arduinoRepository.findOneOrFail(id_ard); 
                arduinos.push(arduino);
            }
            // user
            const userRepository = getRepository(Users);
            user.push(await userRepository.findOneOrFail(id_user));
        

            try {
                // Unir hora y fecha
                const element = Object.assign({}, newTarea);
                const fechaSola=element['fecha'].split('T')[0];
                let horaSola=element['hora'].split(' ')[0];
                const amPm=element['hora'].split(' ')[1];
                let  ceroTe='';
                if(amPm=='AM'){;
                    if(horaSola.split(':')[0]=='12'){
                    horaSola='00'+':'+horaSola.split(':')[1];
                    }
                }else{
                    if(horaSola.split(':')[0]!='12'){
                    horaSola=(parseInt(horaSola.split(':')[0])+12)+':'+horaSola.split(':')[1];
                    }
                }
                if(horaSola.split(':')[0].length==1){
                    ceroTe='T0'
                }else{
                    ceroTe='T'
                }
                
                const fechaUnida=fechaSola+ceroTe+horaSola+':00.000Z'; 
                newTarea['fecha']=fechaUnida; 
                // agregar arduino y usuario 
                newTarea['id_arduino']=arduinos;
                newTarea['id_user']= user;
                await tareaRepository.save(newTarea);  
            } catch (e) {
                res.status(409).json({ message: 'Algo salió mal' });
            }

            res.status(201).json({ 
                ok: true,
                message: 'Tarea creada',
                newTarea
            });
        } catch (error) {
            console.log(error)
        }
    }

    static edit = async (req:Request, res: Response) => {
        let tarea;  
        // const { id } = req.objeto;
        // const { nombre, fecha } = req.formValue; 
        const { id } = req.params;
        const { nombre, fecha, hora, comp_arduino } = req.body;  

        const tareaRepository = getRepository(Tarea); 
        
        try {
            tarea = await tareaRepository.findOneOrFail(id);  
            tarea.nombre = nombre;
            tarea.fecha = fecha;
            tarea.hora = hora;
            tarea.comp_arduino = comp_arduino;
        } catch (error) {
            res.status(404).json({ message: 'No existe la tarea con ese id' });
        }
        
        const validationOpt = { validationError: { target: false, value: false } }; 
        const errors = await validate(tarea, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }
 
        try {
            // Unir hora y fecha
            const element = Object.assign({}, tarea);
            const fechaSola=element['fecha'].split('T')[0];
            let horaSola=element['hora'].split(' ')[0];
            const amPm=element['hora'].split(' ')[1];
            let  ceroTe='';
            if(amPm=='AM'){;
                if(horaSola.split(':')[0]=='12'){
                horaSola='00'+':'+horaSola.split(':')[1];
                }
            }else{
                if(horaSola.split(':')[0]!='12'){
                horaSola=(parseInt(horaSola.split(':')[0])+12)+':'+horaSola.split(':')[1];
                }
            }
            if(horaSola.split(':')[0].length==1){
                ceroTe='T0'
            }else{
                ceroTe='T'
            }
            
            const fechaUnida=fechaSola+ceroTe+horaSola+':00.000Z'; 
            tarea['fecha']=fechaUnida; 
            
            await tareaRepository.save(tarea);
        } catch (e) { 
            res.status(409).json({ message: 'Algo salió mal, ya existe' });
        }
 
        res.status(201).json({ message: 'Tarea editada' }); 
    }

    static delete = async (req: Request, res: Response) => {
        const tareaRepository = getRepository(Tarea);
        let tarea;
        try {
            tarea = await tareaRepository.findOneOrFail(req.params.id);
        } catch (error) {
            res.status(404).json({ message: 'No existe la tarea con ese id' });
            console.log(error)
        }
        tarea.estado = 0;
        try {
            await tareaRepository.save(tarea);
        } catch (e) {
            res.status(409).json({ message: 'Algo salió mal' });
        }
        res.status(201).json({ message: 'Tarea eliminada' });
    }

    static getForUser = async(req: Request, res: Response)=> {
        const { id } = req.params;
        const tareaRepository = getRepository(Users);
        const tarea=[];
    
        try {
            const arduinoRes= await tareaRepository.find({
                where: {id:id},
                relations: ['id_tarea'],
            }); 

            arduinoRes.forEach(element => {
                element.id_tarea.forEach(element2 => {
                    if(element2.estado==1){
                        tarea.push(element2); 
                    }
                });
            }); 
            try {
                tarea.sort(function(a, b) {
                    return a.indice - b.indice;
                });
            } catch (error) {
                console.log(error)
            }

            res.status(200).json({
                ok: true,
                tareas: tarea
            });
    
        } catch (error) {
          console.log(error);
        }
    }
    

}

export default TareaController;