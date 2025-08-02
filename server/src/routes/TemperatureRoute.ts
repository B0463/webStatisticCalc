import { Router } from 'express';
import TemperatureController from '../controllers/TemperatureController';

const router = Router();

router.post('/temperature', TemperatureController.getTemperature);

export default router;
