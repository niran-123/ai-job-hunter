import { Router } from 'express';
import { applicationController } from './applicationController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', applicationController.getApplications);
router.post('/', applicationController.createApplication);
router.patch('/:id', applicationController.updateApplication);

export default router;

