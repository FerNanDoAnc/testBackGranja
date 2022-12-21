import { Request, Response } from 'express';
import { descripArdTarea } from '../entity/descripArdTarea';
import { getRepository } from 'typeorm';
import { Arduino } from '../entity/Arduino';

export class descripArdTareaController{

    static getAll = async (req: Request, res: Response) => {
        const descripArdTareaRepository = getRepository(descripArdTarea);
        let descripArdTareas;
        
        try {
            descripArdTareas = await descripArdTareaRepository.find({
                relations: ["id_arduino"]
            });
        } catch (e) {
            res.status(404).json({ message: 'Algo salió mal' });
        }

        if (descripArdTareas.length > 0) {
            res.status(200).json({
                ok: true,
                message: 'Descripciones de tarea obtenidas',
                descripArdTareas
            });
        } else {
            res.status(404).json({ message: 'No hay resultados' });
        }
    }

    static getAllStatusUno = async (req: Request, res: Response) => {
        const descripArdTareaRepository = getRepository(descripArdTarea);
        let descripArdTareas;
        
        try {
            descripArdTareas = await descripArdTareaRepository.find({
                where: {estado: 1},
                relations: ["id_arduino"]
            });
        } catch (e) {
            res.status(404).json({ message: 'Algo salió mal' });
        }

        if (descripArdTareas.length > 0) {
            res.status(200).json({
                ok: true,
                message: 'Descripciones de tarea obtenidas',
                descripArdTareas
            });
        } else {
            res.status(404).json({ message: 'No hay resultados' });
        }
    }

    static getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        let descripArdTareaRepository;
        descripArdTareaRepository = getRepository(descripArdTarea);
        let descripArdTar;
        try {
            descripArdTar = await descripArdTareaRepository.findOneOrFail(id, {
                where: {
                    estado:1
                },
                relations: ["id_arduino"]
            });
        } catch (e) {
            res.status(404).json({ message: 'No hay resultados' });
        }

        if (descripArdTar) {
            res.status(200).json({
                ok: true,
                message: 'Descripción de tarea obtenida',
                descripArdTar
            });
        } else {
            res.status(404).json({ message: 'No hay resultados' });
        }
    }

    static new = async (req: Request, res: Response) => {
        const { nombre, descripcion, id_arduino } = req.body;
        let descripArdTarea;
        descripArdTarea = new descripArdTarea();
        descripArdTarea.nombre = nombre;
        descripArdTarea.descripcion = descripcion;
        descripArdTarea.id_arduino = id_arduino;
        descripArdTarea.estado = 1;
        
        const descripArdTareaRepository = getRepository(descripArdTarea);
        try {
            await descripArdTareaRepository.save(descripArdTarea);
        } catch (e) {
            res.status(409).json({ message: 'Algo salió mal' });
        }

        res.status(201).json({
            ok: true,
            message: 'Descripción de tarea creada',
            descripArdTarea
        });
    }
    
    static edit = async (req: Request, res: Response) => {
        let descripArdTarea;
        const { id } = req.params;
        const { nombre, descripcion, id_arduino } = req.body;

        const descripArdTareaRepository = getRepository(descripArdTarea);
        try {
            descripArdTarea = await descripArdTareaRepository.findOneOrFail(id);
            descripArdTarea.nombre = nombre;
            descripArdTarea.descripcion = descripcion;
            descripArdTarea.id_arduino = id_arduino;
            descripArdTarea.estado = 1;
        } catch (e) {
            res.status(404).json({ message: 'No hay resultados' });
        }

        try {
            await descripArdTareaRepository.save(descripArdTarea);
        } catch (e) {
            res.status(409).json({ message: 'Algo salió mal' });
        }

        res.status(201).json({
            ok: true,
            message: 'Descripción de tarea editada',
            descripArdTarea
        });
    }

    static delete = async (req: Request, res: Response) => {
        const descripTempRepository=getRepository(descripArdTarea);
        let descripArdTar;

        try {
            descripArdTar = await descripTempRepository.findOneOrFail(req.params.id);
            descripArdTar.estado = 0; 
        } catch (error) {
            res.status(404).json({ message: 'No hay resultados' });
        }

        try {
            await descripTempRepository.save(descripArdTar);
        } catch (error) {
            res.status(409).json({ message: 'Algo salió mal' });
        }

        res.status(201).json({
            ok: true,
            message: 'Descripción de tarea eliminada',
            descripArdTar
        });

    }

    static getForArduino = async (req: Request, res: Response) => {
        const { id } = req.params;
        let arduinoRepository;
        arduinoRepository = getRepository(Arduino);
        try {
            const descripArdTarea = await arduinoRepository.findOneOrFail(id, {
                relations: ["id_descripArdTarea"]
            }); 
            
            res.status(200).json({
                ok: true,
                message: 'Descripción de tarea obtenida',
                descripArdTarea
            });
        } catch (e) {
            res.status(404).json({ message: 'No hay resultados' });
        }
    }
}
