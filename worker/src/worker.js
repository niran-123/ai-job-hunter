import pino from 'pino';
import { queueManager, QUEUE_NAMES } from './queues/queueManager.js';
import { GreenhouseAdapter } from '../../server/src/collectors/greenhouseAdapter.js';
import { LeverAdapter } from '../../server/src/collectors/leverAdapter.js';
import { jobNormalizer } from '../../server/src/modules/normalization/jobNormalizer.js';
import { eligibilityEngine } from '../../server/src/modules/eligibility/eligibilityEngine.js';
import { aiService } from '../../server/src/modules/ai/aiService.js';
import { profileMatcher } from '../../server/src/modules/matching/profileMatcher.js';
import { duplicateDetector } from '../../server/src/modules/duplicates/duplicateDetector.js';
import { jobVerifier } from '../../server/src/modules/verification/jobVerifier.js';
import { gmailDigestService } from '../../server/src/modules/notifications/gmailDigestService.js';
import { store } from '../../server/src/services/store.js';

const logger = pino({ name: 'JobHunterWorker' });

export class AutomatedWorker {
  constructor() {
    this.isRunning = false;
    this.timers = [];
  }

  async start() {
    logger.info('🚀 Starting AI Global Job Hunter background workers...');
    await queueManager.init();
    this.isRunning = true;
    logger.info('✅ Worker initialized successfully and running in direct pipeline mode.');

    // Run an initial discovery scan on start
    if (store.settings.agentActive) {
      logger.info('🔍 Running initial job discovery scan on startup...');
      this.runDiscoveryPipeline()
        .then(() => logger.info('✨ Initial discovery cycle completed.'))
        .catch(err => logger.error({ error: err.message }, 'Initial discovery scan error'));
    }

    // Start background repeatable cycles
    this.scheduleDiscovery(30 * 60 * 1000); // Every 30 mins
    this.scheduleVerification(60 * 60 * 1000); // Every hour
    this.scheduleDigestCheck(5 * 60 * 1000); // Check digest trigger every 5 mins
  }

  stop() {
    this.isRunning = false;
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers = [];
    logger.info('AutomatedWorker stopped.');
  }

  scheduleDiscovery(intervalMs) {
    const timer = setInterval(async () => {
      if (!store.settings.agentActive) return;
      logger.info('Starting automated job discovery cycle...');
      try {
        await this.runDiscoveryPipeline();
      } catch (err) {
        logger.error({ error: err.message }, 'Automated discovery cycle failed');
      }
    }, intervalMs);
    this.timers.push(timer);
    return timer;
  }

  scheduleVerification(intervalMs) {
    const timer = setInterval(async () => {
      if (!store.settings.agentActive) return;
      logger.info('Starting job verification check...');
      for (const job of store.jobs.filter(j => j.status === 'ACTIVE').slice(0, 5)) {
        const check = await jobVerifier.verifyJob(job);
        if (check.status !== job.status) {
          job.status = check.status;
          job.verifiedAt = check.checkedAt;
        }
      }
    }, intervalMs);
    this.timers.push(timer);
    return timer;
  }

  scheduleDigestCheck(intervalMs) {
    const timer = setInterval(async () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      if (currentTime === store.settings.dailyDigestTime) {
        logger.info('Daily digest time reached. Preparing digest batch...');
        // Prepare eligible jobs for digest
        const eligibleJobs = store.jobs.filter(j => j.eligibilityStatus === 'ELIGIBLE');
        if (eligibleJobs.length > 0) {
          const content = gmailDigestService.generateDigestContent({
            recipientName: 'Engineer',
            jobs: eligibleJobs,
            digestDate: now
          });
          logger.info(`Daily digest email generated with ${eligibleJobs.length} opportunities.`);
        }
      }
    }, intervalMs);
    this.timers.push(timer);
    return timer;
  }

  async runDiscoveryPipeline() {
    const greenhouse = new GreenhouseAdapter();
    const lever = new LeverAdapter();

    const ghBoards = ['stripe', 'canonical', 'inmobi', 'elastic', 'groww'];
    const leverSites = ['cred', 'zeta', 'meesho', 'paytm'];

    const [ghResults, leverResults] = await Promise.all([
      Promise.all(ghBoards.map(boardToken => greenhouse.fetchJobs({ boardToken }))),
      Promise.all(leverSites.map(site => lever.fetchJobs({ site })))
    ]);

    const rawList = [...ghResults.flat(), ...leverResults.flat()];

    let newCount = 0;
    for (const raw of rawList) {
      try {
        const normalized = jobNormalizer.normalize(raw, raw.sourceType === 'GREENHOUSE' ? 'src_1' : 'src_2');
        const dup = duplicateDetector.findDuplicate(normalized, store.jobs);
        if (dup.isDuplicate) {
          duplicateDetector.recordDuplicate(normalized, dup.matchedJob, dup.reason, dup.confidence, store);
          continue;
        }

        const eligibility = eligibilityEngine.evaluate(normalized);
        normalized.eligibilityStatus = eligibility.status;
        normalized.eligibilityReason = eligibility.reason;

        if (eligibility.status === 'ELIGIBLE') {
          const profile = store.profiles[0];
          const match = profileMatcher.match(normalized, profile);
          normalized.analysis = {
            jobSummary: `${normalized.jobTitle} at ${normalized.companyName}`,
            ...match,
            aiProvider: 'gemini',
            aiModel: 'gemini-1.5-flash',
            analyzedAt: new Date().toISOString()
          };
        }

        store.jobs.unshift(normalized);
        newCount++;
      } catch (err) {
        logger.warn({ error: err.message }, 'Job pipeline item error');
      }
    }
    store.updateCountryJobCounts();
    logger.info(`Discovery cycle completed. Ingested ${newCount} new verified jobs.`);
  }
}

const workerInstance = new AutomatedWorker();

if (process.argv[1]?.includes('worker.js')) {
  workerInstance.start();

  const shutdown = async () => {
    logger.info('Shutting down AutomatedWorker cleanly...');
    workerInstance.stop();
    await queueManager.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default workerInstance;

