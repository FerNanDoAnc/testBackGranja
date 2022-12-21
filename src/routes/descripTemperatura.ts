import { Router } from 'express'; 
import { descripTemperaturaController } from '../controller/descripTemperaturaController';

const router = Router();

// Get all componentes
router.get('/', descripTemperaturaController.getAll);

// Get all status uno
router.get('/validas', descripTemperaturaController.getAllStatusUno);

// Get one componente
router.get('/:id', descripTemperaturaController.getById);

// Get por Arduino
router.get('/arduino/:id', descripTemperaturaController.getForArduino)

// Create a new componente
router.post('/', descripTemperaturaController.new);

// Edit componente
router.patch('/:id', descripTemperaturaController.edit);

// Delete componente
router.delete('/:id', descripTemperaturaController.delete);

export default router;
