import { Router } from 'express';
import { sourceController } from './sourceController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', sourceController.getSources);
router.get('/health', sourceController.getSourceHealth);
router.get('/:id', sourceController.getSourceById);
router.patch('/:id', authMiddleware, sourceController.updateSource);

export default router;

