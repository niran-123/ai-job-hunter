import { Router } from 'express';
import { notificationController } from './notificationController.js';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/gmail/auth-url', authMiddleware, notificationController.getGmailAuthUrl);
router.get('/gmail/callback', notificationController.handleGmailCallback);
router.get('/gmail/status', authMiddleware, notificationController.getGmailStatus);
router.post('/test', authMiddleware, notificationController.sendTestEmail);
router.get('/history', authMiddleware, notificationController.getHistory);
router.put('/settings', authMiddleware, notificationController.updateSettings);

export default router;

