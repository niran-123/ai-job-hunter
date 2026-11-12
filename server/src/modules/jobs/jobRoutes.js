import { Router } from 'express';
import { jobController } from './jobController.js';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/recent', optionalAuthMiddleware, jobController.getRecentJobs);
router.get('/recommended', optionalAuthMiddleware, jobController.getRecommendedJobs);
router.get('/search', optionalAuthMiddleware, jobController.searchJobs);
router.get('/:id', optionalAuthMiddleware, jobController.getJobById);
router.patch('/:id/status', authMiddleware, jobController.updateJobStatus);
router.get('/', optionalAuthMiddleware, jobController.getJobs);

export default router;

