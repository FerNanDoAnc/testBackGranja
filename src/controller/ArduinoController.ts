import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { Arduino } from '../entity/Arduino';
import { Users } from '../entity/Users';
import { validate } from 'class-validator';

export class ArduinoController {

  static getAll = async (req: Request, res: Response) => {
    const arduinoRepository = getRepository(Arduino);
    let arduinos;

    try {
      arduinos = await arduinoRepository.find({ 
        relations: ["id_user","id_tarea","id_descripArdTarea"]
      });
    } catch (e) {
      res.status(404).json({ message: 'Algo salió mal' });
    }
 
    if (arduinos.length > 0) {
      res.send(arduinos);
    } else {
      res.status(404).json({ message: 'No hay resultados' });
    }
  };

  static getAllStatusUno = async (req: Request, res: Response) => {  

    const arduinoRepository = getRepository(Arduino);
    let arduinos;

    try {
      arduinos = await arduinoRepository.find({ 
        where: {estado: 1},
        relations: ["id_user","id_tarea","id_descripArdTarea"]
      });
    } catch (e) {
      res.status(404).json({ message: 'Algo salió mal' });
    }
 
    if (arduinos.length > 0) {
      res.send(arduinos);
    } else {
      res.status(404).json({ message: 'No hay resultados' });
    }
  }

  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const arduinoRepository = getRepository(Arduino);
    try {
      const arduino = await arduinoRepository.findOneOrFail(id,{
        where: {
          estado:1
      },
      relations: ['id_tarea','id_user',"id_descripArdTarea"]
      });
      res.send(arduino);
    } catch (e) {
      res.status(404).json({ message: 'Not hay resultados'});
    }
  };

  static new = async (req: Request, res: Response) => {
    const { nombre, opc, estado, id_user } = req.body;
    const arduino = new Arduino();

    arduino.nombre = nombre;
    arduino.opc = opc;
    arduino.estado = estado;
    arduino.id_user =id_user

    // Validate
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(arduino, validationOpt);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // All ok
    const userRepository = getRepository(Arduino);
    userRepository.save(arduino);
    res.send('Componente created');
  };

  static edit = async (req: Request, res: Response) => {
    let arduino;
    const { id } = req.params;
    const { nombre, opc,estado } = req.body;

    const arduinoRepository = getRepository(Arduino);
    // Try get user
    try {
      arduino = await arduinoRepository.findOneOrFail(id);
      arduino.nombre = nombre;
      arduino.opc = opc;
      arduino.estado = estado;
    } catch (e) {
      return res.status(404).json({ message: 'Componente no encontrado' });
    }
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(arduino, validationOpt);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // Try to save user
    try {
      await arduinoRepository.save(arduino);
    } catch (e) {
      return res.status(409).json({ message: 'Error al guardar-el nombre ya está en uso' });
    }

    res.status(201).json({ message: 'Componente Actualizado' });
  };

  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const arduinoRepository = getRepository(Arduino);
    let arduino: Arduino;

    try {
      arduino = await arduinoRepository.findOneOrFail(id);
    } catch (e) {
      return res.status(404).json({ message: 'Componente no encontrado' });
    }

    // Remove user
    arduinoRepository.delete(id);
    res.status(201).json({ message: ' Componente Eliminado' });
  };

  static getForUser = async(req: Request, res: Response)=> {
    const { id } = req.params;
    const arduinoRepository = getRepository(Users);
    const arduino=[];

    try {
      
      const arduinoRes= await arduinoRepository.find({
        where: {id:id},
        relations: ['id_arduino']
      });
      
      arduinoRes.forEach(element => {
        arduino.push(element.id_arduino);
      });

      res.status(200).json({
        ok: true,
        arduinos: arduino
    });

    } catch (error) {
      console.log(error);
    }
}

}

export default ArduinoController;

