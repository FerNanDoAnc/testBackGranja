import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { descripTemperatura } from '../entity/descripTemperatura';
import { validate } from 'class-validator';
import { Arduino } from '../entity/Arduino';

export class descripTemperaturaController{

    static getAll = async (req: Request, res: Response) => {
        const descripTemperaturaRepository = getRepository(descripTemperatura);
        let descripTemperaturas;

        try {
            descripTemperaturas = await descripTemperaturaRepository.find({ 
                relations: ["id_arduino"]
            });
        } catch (e) {
            res.status(404).json({ message: 'Algo salió mal' });
        }
    
        if (descripTemperaturas.length > 0) {
            res.status(200).json({
                ok: true,
                message: 'Descripciones de temperatura obtenidas',
                descripTemperaturas
            });
        } else {
            res.status(404).json({ message: 'No hay resultados' });
        }
    }

    static getAllStatusUno = async (req: Request, res: Response) => {
        const descripTemperaturaRepository = getRepository(descripTemperatura);
        let descripTemperaturas;
        
        try {
            descripTemperaturas = await descripTemperaturaRepository.find({ 
                where: {estado: 1},
                relations: ["id_arduino"]
            });
        }
        catch (e) {
            res.status(404).json({ message: 'Algo salió mal' });
        }

        
        if (descripTemperaturas.length > 0) {
            res.status(200).json({
                ok: true,
                message: 'Descripciones de temperatura obtenidas',
                descripTemperaturas
            });
        } else {
            res.status(404).json({ message: 'No hay resultados' });
        }
    }

    static getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const descripTemperaturaRepository = getRepository(descripTemperatura);
        try {
            const descripTemperatura = await descripTemperaturaRepository.findOneOrFail(id,{
                where: {
                    estado:1
                },
                relations: ['id_arduino']
            });
            res.status(200).json({
                ok: true,
                message: 'Descripción de temperatura encontrada',
                descripTemperatura
            });
        } catch (e) {
            res.status(404).json({ message: 'Algo salió mal' });
        }
        
    }

    static new = async (req: Request, res: Response) => {
        try {
            const descripTemperaturaRepository = getRepository(descripTemperatura);
            const newDescripTemperatura = descripTemperaturaRepository.create(req.body);

            const { id_arduino } = req.body;
            let arduino;
            const arduinoRepository = getRepository(Arduino);
            arduino = await arduinoRepository.findOneOrFail(id_arduino);
        
            try {
                await descripTemperaturaRepository.save(newDescripTemperatura);
            } catch (error) {
                res.status(409).json({ message: 'Algo salió mal' });
            }

            res.status(200).json({
                ok: true,
                message: 'Descripción de temperatura creada',
                newDescripTemperatura
            });
        } catch (error) {
            console.log("Error al crear",error);
        }

    }

    static edit = async (req: Request, res: Response) => {
        try {
            let desTemperatura;
            const { id } = req.params;
            const { encenderTempc } = req.body; 
            const descripTemperaturaRepository = getRepository(descripTemperatura);
            
            //Try get descripTemperatura
            try {
                desTemperatura = await descripTemperaturaRepository.findOneOrFail(id); 
                desTemperatura.encenderTempC = encenderTempc;
            } catch (e) {
                return res.status(404).json({ message: 'No existe detTemperatura con ese id' });
            }

            const validationOpt = { validationError: { target: false, value: false } }; 
            const errors = await validate(descripTemperatura, validationOpt); 
            if (errors.length > 0) {
                return res.status(400).json(errors);
            }
            
            //Try to save descripTemperatura
            let descripTemp;
            try {
                descripTemp= await descripTemperaturaRepository.save(desTemperatura);
            } catch (e) {
                return res.status(409).json({ message: 'Algo salió mal' });
            }
            res.status(200).json({
                ok: true,
                message: 'Descripción de temperatura actualizada',
                descripTemp
            });

        } catch (error) {
            console.log("Error al editar",error);
        }
    }

    static delete = async (req: Request, res: Response) => {
        const descripTempRepository = getRepository(descripTemperatura);
        let descripTemp;
        try{
            descripTemp= await descripTempRepository.findOneOrFail(req.params.id);
            descripTemp.estado=0;
        }catch(e){
            return res.status(404).json({message: 'Algo salió mal'});
        }

        // Try to save descripTemp
        try{
            await descripTempRepository.save(descripTemp);
        }catch(e){
            return res.status(409).json({message: 'Algo salió mal'});
        }

        // If all ok
        res.status(200).json({
            ok: true,
            message: 'Descripción de temperatura eliminada',
            descripTemp
        });
    }

    static getForArduino = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const descripTemperaturaRepository = getRepository(descripTemperatura); 
            let descripTemperaturas;
            
            try {
                descripTemperaturas = await descripTemperaturaRepository.find({ 
                    where: {id_arduino:id},
                    relations: ["id_arduino"]
                });
            }
            catch (e) {
                res.status(404).json({ message: 'Algo salió mal' });
            }

            
            if (descripTemperaturas.length > 0) {
                res.status(200).json({
                    ok: true,
                    message: 'Descripciones de temperatura obtenidas',
                    descripTemperaturas
                });
            } else {
                res.status(404).json({ message: 'No hay resultados' });
            }
        } catch (error) {
            console.log("Error al obtener",error);
        }
    }
}