import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { Users } from '../entity/Users';
import { validate } from 'class-validator';

export class UserController {
  static getAll = async (req: Request, res: Response) => {
    const userRepository = getRepository(Users);
    let users;

    try {
      users = await userRepository.find({ select: ['id', 'name', 'username', 'role'] });
    } catch (e) {
      res.status(404).json({ message: 'Algo salió mal' });
    }

    if (users.length > 0) {
      res.send(users);
    } else {
      res.status(404).json({ message: 'No hay resultados' });
    }
  };

  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = getRepository(Users);
    try {
      const user = await userRepository.findOneOrFail(id,{
        relations: ['id_arduino','id_tarea']
    });
      res.send(user);
    } catch (e) {
      res.status(404).json({ message: 'No hay resultados usuarios con ese id' });
    }
  };

  static new = async (req: Request, res: Response) => {
    const { name,username, password, role } = req.body;
    const user = new Users();
    user.name = name;
    user.username = username;
    user.password = password;
    user.role = role;

    // Validate
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOpt);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // TODO: HASH PASSWORD

    const userRepository = getRepository(Users);
    try {
      user.hashPassword();
      await userRepository.save(user);
    } catch (e) {
      return res.status(409).json({ message: 'El username ya existe' });
    }
    //  ok
    const { password:_, ...resto} = user;
    res.status(200).json({
      ok: true,
      message: 'Usuario creado',
      resto,
    });
  };

  static edit = async (req: Request, res: Response) => {
    let user;
    const { id } = req.params;
    const { name, username, role } = req.body;

    const userRepository = getRepository(Users);
    // Try get user
    try {
      user = await userRepository.findOneOrFail(id);
      user.name = name;
      user.username = username;
      user.role = role;
    } catch (e) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOpt);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // Try to save user
    try {
      await userRepository.save(user);
    } catch (e) {
      return res.status(409).json({ message: 'El username ya está en uso' });
    }

    res.status(201).json({
      ok: true,
      message: 'User Actualizado',
      user,
    });
  };

  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = getRepository(Users);
    let user: Users;

    try {
      user = await userRepository.findOneOrFail(id);
    } catch (e) {
      return res.status(404).json({ message: 'User no encontrado' });
    }

    // Remove user
    userRepository.delete(id);
    res.status(201).json({ message: ' User Eliminado' });
  };
}

export default UserController;

