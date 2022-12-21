import { checkRole } from './../middlewares/role';
import { checkJwt } from './../middlewares/jwt';
import { UserController } from './../controller/UserController';
import { Router } from 'express';

const router = Router();

// Get all users
router.get('/',[checkJwt, checkRole(['administrador'])], UserController.getAll);

// Get one user
router.get('/:id',[checkJwt, checkRole(['administrador'])],  UserController.getById);

// Create a new user
router.post('/', [checkJwt, checkRole(['administrador'])], UserController.new);

// Edit user
router.patch('/:id', [checkJwt, checkRole(['administrador'])], UserController.edit);

// Delete
router.delete('/:id', [checkJwt, checkRole(['administrador'])], UserController.delete);

export default router;






// "dev": "ts-node-dev --respawn --transpile-only ./src/index.ts",
// -- ad column mysql
// ALTER TABLE tabla1 add colNueva varchar(2) NOT NULL; 