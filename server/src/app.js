import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/authRoutes.js';
import jobRoutes from './modules/jobs/jobRoutes.js';
import savedJobRoutes from './modules/savedJobs/savedJobRoutes.js';
import applicationRoutes from './modules/applications/applicationRoutes.js';
import countryRoutes from './modules/countries/countryRoutes.js';
import profileRoutes from './modules/profiles/profileRoutes.js';
import settingsRoutes from './modules/settings/settingsRoutes.js';
import sourceRoutes from './modules/sources/sourceRoutes.js';
import notificationRoutes from './modules/notifications/notificationRoutes.js';
import agentRoutes from './modules/agent/agentRoutes.js';

export const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'UP',
      database: 'UP',
      redis: 'UP'
    }
  });
});

// REST API Base Route: /api/v1
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/saved-jobs', savedJobRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/countries', countryRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/sources', sourceRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/agent', agentRoutes);

app.use('/api/v1', apiRouter);

// Centralized Error Handling
app.use(errorHandler);

export default app;

