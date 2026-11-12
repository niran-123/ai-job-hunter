import { Router } from 'express';
import { savedJobController } from './savedJobController.js';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthMiddleware, savedJobController.getSavedJobs);
router.post('/', authMiddleware, savedJobController.saveJob);
router.delete('/:id', authMiddleware, savedJobController.removeSavedJob);

export default router;

