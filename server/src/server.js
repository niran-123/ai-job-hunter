import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`⚡ AI Global Job Hunter REST API running on port ${PORT} [${env.NODE_ENV}]`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

export default server;

