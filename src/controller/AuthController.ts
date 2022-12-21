import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { Users } from '../entity/Users';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import { validate } from 'class-validator';

class AuthController {
  static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).json({ message: 'Ingrese Username & Password!' });
    }

    const userRepository = getRepository(Users);
    let user: Users;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (e) {
      return res.status(400).json({ message: ' Username y/o Password incorecctas!' });
    }

    try { 
      const validPassword = await user.checkPassword(password); 
       // Check password
      if ( !validPassword) {
        return res.status(400).json({ message: 'Username  y/o Password incorrectos!' });
      }
    }catch (error) {
      console.log(error);
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, config.jwtSecret, { expiresIn: '24h' });
    
    res.json({ message: 'OK', token, userId: user.id, name:user.name, role: user.role, username:user.username });
  };

  static changePassword = async (req: Request, res: Response) => {
    const { userId } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
      res.status(400).json({ message: 'Ingrese la antigua y nueva password' });
    }

    const userRepository = getRepository(Users);
    let user: Users;

    try {
      user = await userRepository.findOneOrFail(userId);
    } catch (e) {
      res.status(400).json({ message: 'Algo salió mal!' });
    }

    if (!user.checkPassword(oldPassword)) {
      return res.status(401).json({ message: 'Verifica tu antigua Password' });
    }

    user.password = newPassword;
    const validationOps = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOps);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // Hash password
    user.hashPassword();
    userRepository.save(user);

    res.json({ message: 'Password actualizada!' });
  };
}
export default AuthController;
