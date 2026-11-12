import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let redisClient = null;

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis reconnection limit reached, running in standalone mode');
        return null;
      }
      return Math.min(times * 100, 1000);
    },
    lazyConnect: true
  });

  redisClient.on('error', (err) => {
    logger.warn({ error: err.message }, 'Redis connection warning');
  });

  redisClient.on('connect', () => {
    logger.info('Connected to Redis');
  });
} catch (err) {
  logger.warn('Redis client initialization skipped, background jobs will run in direct mode');
}

export const redis = redisClient;
export default redis;

