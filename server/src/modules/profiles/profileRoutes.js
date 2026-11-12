import { Router } from 'express';
import { profileController } from './profileController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

export default router;

