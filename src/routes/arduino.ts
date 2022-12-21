import { checkRole } from './../middlewares/role';
import { checkJwt } from './../middlewares/jwt';
import { ArduinoController } from './../controller/ArduinoController';
import { Router } from 'express';

const router = Router();

// Get all componentes
router.get('/', ArduinoController.getAll);

// Get all status uno
router.get('/validas', ArduinoController.getAll);

// Get one componente
router.get('/:id',  ArduinoController.getById);

// Get componente por id user
router.get('/user/:id',  ArduinoController.getForUser);

// Create a new componente
router.post('/', [checkJwt, checkRole(['administrador'])], ArduinoController.new);

// Edit componente
router.patch('/:id', [checkJwt, checkRole(['administrador'])], ArduinoController.edit);

// Delete componente
router.delete('/:id', [checkJwt, checkRole(['administrador'])], ArduinoController.delete);

export default router;


