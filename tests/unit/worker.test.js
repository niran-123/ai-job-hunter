import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { QueueManager, QUEUE_NAMES, queueManager } from '../../worker/src/queues/queueManager.js';
import { AutomatedWorker } from '../../worker/src/worker.js';

describe('Worker & QueueManager Suite', () => {
  test('QUEUE_NAMES contains all required queue keys', () => {
    assert.ok(QUEUE_NAMES.JOB_DISCOVERY, 'JOB_DISCOVERY queue exists');
    assert.ok(QUEUE_NAMES.JOB_NORMALIZATION, 'JOB_NORMALIZATION queue exists');
    assert.ok(QUEUE_NAMES.ELIGIBILITY_CHECK, 'ELIGIBILITY_CHECK queue exists');
    assert.ok(QUEUE_NAMES.AI_ANALYSIS, 'AI_ANALYSIS queue exists');
    assert.ok(QUEUE_NAMES.DUPLICATE_DETECTION, 'DUPLICATE_DETECTION queue exists');
    assert.ok(QUEUE_NAMES.JOB_VERIFICATION, 'JOB_VERIFICATION queue exists');
    assert.ok(QUEUE_NAMES.NOTIFICATION_QUEUE, 'NOTIFICATION_QUEUE queue exists');
  });

  test('QueueManager initializes cleanly and falls back when Redis is offline', async () => {
    const qm = new QueueManager();
    assert.equal(qm.isRedisAvailable, false);
    assert.equal(Object.keys(qm.queues).length, 0);

    // Initializing with offline redis does not throw
    await qm.init();
    assert.equal(typeof qm.isRedisAvailable, 'boolean');
  });

  test('QueueManager.addJob returns fallback job ID and data when Redis is unavailable', async () => {
    const qm = new QueueManager();
    const mockData = { test: true, url: 'https://example.com/job/1' };
    const job = await qm.addJob(QUEUE_NAMES.JOB_DISCOVERY, mockData);

    assert.ok(job);
    assert.ok(job.id.startsWith('direct_'));
    assert.deepEqual(job.data, mockData);
  });

  test('QueueManager initializes queues and routes addJob when Redis is connected', async () => {
    const qm = new QueueManager();

    // Mock an active Redis instance that simulates 'ready' status
    let duplicatedOptions = null;
    const mockClient = {
      status: 'ready',
      duplicate: (opts) => {
        duplicatedOptions = opts;
        return {
          status: 'ready',
          quit: async () => true,
          on: () => {},
          once: () => {},
          emit: () => {}
        };
      }
    };

    await qm.init(mockClient);
    assert.equal(qm.isRedisAvailable, true);
    assert.deepEqual(duplicatedOptions, { maxRetriesPerRequest: null });
    assert.equal(Object.keys(qm.queues).length, Object.keys(QUEUE_NAMES).length);

    // Mock add on one queue to test addJob in connected mode
    const testQueue = qm.getQueue(QUEUE_NAMES.JOB_DISCOVERY);
    assert.ok(testQueue, 'Queue instance retrieved');
    testQueue.add = async (name, data, opts) => ({ id: 'bullmq_job_123', name, data });

    const job = await qm.addJob(QUEUE_NAMES.JOB_DISCOVERY, { test: 'bullmq' });
    assert.equal(job.id, 'bullmq_job_123');

    await qm.close();
    assert.equal(qm.isRedisAvailable, false);
    assert.equal(Object.keys(qm.queues).length, 0);
  });

  test('QueueManager handles Redis wait status and connection failure cleanly', async () => {
    const qm = new QueueManager();
    const mockClient = {
      status: 'wait',
      connect: async () => {
        throw new Error('ECONNREFUSED 127.0.0.1:6379');
      }
    };

    await qm.init(mockClient);
    assert.equal(qm.isRedisAvailable, false);
    assert.equal(Object.keys(qm.queues).length, 0);
  });

  test('AutomatedWorker lifecycle: starts and stops cleanly', async () => {
    const worker = new AutomatedWorker();
    assert.equal(worker.isRunning, false);
    assert.equal(worker.timers.length, 0);

    await worker.start();
    assert.equal(worker.isRunning, true);
    assert.equal(worker.timers.length, 3); // 3 interval timers registered

    worker.stop();
    assert.equal(worker.isRunning, false);
    assert.equal(worker.timers.length, 0); // all timers cleared
  });

  test('AutomatedWorker runDiscoveryPipeline runs to completion', async () => {
    const worker = new AutomatedWorker();
    // Discovery pipeline should run without error using built-in resilient collector fallbacks
    await assert.doesNotReject(async () => {
      await worker.runDiscoveryPipeline();
    });
  });
});
