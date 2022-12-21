import { Router } from 'express';
import auth from './auth';
import user from './user';
import arduino from './arduino';
import tarea from './tarea';
import descripTemperatura from './descripTemperatura';
import descripArdTarea  from './descripArdTarea';
const routes = Router();

routes.use('/auth', auth);
routes.use('/users', user);
routes.use('/arduinos', arduino);
routes.use('/tareas', tarea);
routes.use('/det_temperatura', descripTemperatura);
routes.use('/det_ard_tarea', descripArdTarea);

export default routes;
