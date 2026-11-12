import { Router } from 'express';
import { agentController } from './agentController.js';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/status', optionalAuthMiddleware, agentController.getStatus);
router.post('/start', authMiddleware, agentController.startAgent);
router.post('/pause', authMiddleware, agentController.pauseAgent);
router.post('/scan', authMiddleware, agentController.triggerScan);
router.get('/logs', optionalAuthMiddleware, agentController.getLogs);
router.get('/statistics', optionalAuthMiddleware, agentController.getStatistics);

export default router;

