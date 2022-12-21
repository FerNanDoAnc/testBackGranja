import { checkRole } from './../middlewares/role';
import { checkJwt } from './../middlewares/jwt';
import { TareaController }  from './../controller/TareaController';
import { Router } from 'express'; 

const router = Router();

// Get all componentes
router.get('/', TareaController.getAll); 

// Get all status uno
router.get('/validas', TareaController.getAllStatusUno);

// Get one componente
router.get('/:id', TareaController.getById);

// Get componente por id user
router.get('/user/:id',  TareaController.getForUser);

// Create a new componente
router.post('/', TareaController.new);

// Edit componente
router.patch('/:id',  TareaController.edit);

// Delete componente
router.delete('/:id',  TareaController.delete);

export default router;
