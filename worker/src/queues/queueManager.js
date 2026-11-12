import { Queue } from 'bullmq';
import { redis } from '../../../server/src/config/redis.js';
import pino from 'pino';

const logger = pino({ name: 'QueueManager' });

export const QUEUE_NAMES = {
  JOB_DISCOVERY: 'job-discovery',
  JOB_NORMALIZATION: 'job-normalization',
  ELIGIBILITY_CHECK: 'eligibility-check',
  AI_ANALYSIS: 'ai-analysis',
  DUPLICATE_DETECTION: 'duplicate-detection',
  JOB_VERIFICATION: 'job-verification',
  NOTIFICATION_QUEUE: 'notification-queue'
};

export class QueueManager {
  constructor() {
    this.queues = {};
    this.isRedisAvailable = false;
    this.bullmqConnection = null;
  }

  async init(customRedis = null) {
    const client = customRedis || redis;
    try {
      if (client) {
        if (client.status === 'wait') {
          try {
            await client.connect();
          } catch {
            // Redis offline or unreachable; disconnect so retry timers don't keep process alive
            try {
              if (typeof client.disconnect === 'function') {
                client.disconnect();
              }
            } catch {
              // Ignore teardown error
            }
          }
        }

        if (client.status === 'ready') {
          this.isRedisAvailable = true;
          this.bullmqConnection = typeof client.duplicate === 'function'
            ? client.duplicate({ maxRetriesPerRequest: null })
            : client;

          for (const [key, qName] of Object.entries(QUEUE_NAMES)) {
            this.queues[qName] = new Queue(qName, {
              connection: this.bullmqConnection,
              defaultJobOptions: {
                attempts: 3,
                backoff: {
                  type: 'exponential',
                  delay: 2000
                },
                removeOnComplete: 100,
                removeOnFail: 500
              }
            });
          }
          logger.info('BullMQ Queues initialized with Redis');
          return;
        }
      }
      logger.warn('Redis unavailable. QueueManager running in direct pipeline mode.');
    } catch (err) {
      logger.warn({ error: err.message }, 'Queue initialization falling back to direct pipeline');
    }
  }

  getQueue(queueName) {
    return this.queues[queueName] || null;
  }

  async addJob(queueName, jobData, opts = {}) {
    if (this.isRedisAvailable && this.queues[queueName]) {
      return await this.queues[queueName].add(queueName, jobData, opts);
    }
    // Direct in-process fallback
    return { id: `direct_${Date.now()}`, data: jobData };
  }

  async close() {
    for (const queue of Object.values(this.queues)) {
      await queue.close();
    }
    if (this.bullmqConnection && typeof this.bullmqConnection.quit === 'function') {
      try {
        await this.bullmqConnection.quit();
      } catch {
        // Ignore disconnect errors on teardown
      }
      this.bullmqConnection = null;
    }
    this.queues = {};
    this.isRedisAvailable = false;
  }
}

export const queueManager = new QueueManager();
export default queueManager;

