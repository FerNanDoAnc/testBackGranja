import { Router } from "express";
import { descripArdTareaController } from '../controller/descripArdTareaController';

const router = Router();

// Get all componentes
router.get("/", descripArdTareaController.getAll);

// Get all status uno
router.get("/validas", descripArdTareaController.getAllStatusUno);

// Get one componente
router.get("/:id", descripArdTareaController.getById);

// Get por Arduino
router.get("/arduino/:id", descripArdTareaController.getForArduino);

// Create a new componente
router.post("/", descripArdTareaController.new);

// Edit componente
router.patch("/:id", descripArdTareaController.edit);

// Delete componente
router.delete("/:id", descripArdTareaController.delete);

export default router;
