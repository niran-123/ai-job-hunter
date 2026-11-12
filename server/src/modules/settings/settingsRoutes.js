import { Router } from 'express';
import { settingsController } from './settingsController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

export default router;

