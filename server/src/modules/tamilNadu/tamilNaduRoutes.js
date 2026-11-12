import express from 'express';
import { TAMIL_NADU_STATS, getTamilNaduDirectory } from './tamilNaduRegistry.js';
import { tamilNaduCollector } from './tamilNaduCollector.js';
import { store } from '../../services/store.js';

const router = express.Router();

/**
 * GET /api/v1/tamil-nadu/stats
 * Returns breakdown of 7,525+ registered software & IT companies in Tamil Nadu.
 */
router.get('/stats', (req, res) => {
  return res.json({
    success: true,
    data: TAMIL_NADU_STATS
  });
});

/**
 * GET /api/v1/tamil-nadu/directory
 * Returns searchable master directory of Tamil Nadu IT companies.
 */
router.get('/directory', (req, res) => {
  const { city, category, search } = req.query;
  const companies = getTamilNaduDirectory({ city, category, search });

  return res.json({
    success: true,
    total: companies.length,
    registeredEcosystemTotal: TAMIL_NADU_STATS.totalRegisteredCompanies,
    data: companies
  });
});

/**
 * POST /api/v1/tamil-nadu/scan
 * Triggers on-demand discovery scan across Tamil Nadu IT companies.
 */
router.post('/scan', async (req, res) => {
  try {
    const jobs = await tamilNaduCollector.scanTamilNaduOpportunities();
    let ingestedCount = 0;

    for (const job of jobs) {
      const exists = store.jobs.some(j => j.externalId === job.externalId || j.canonicalUrl === job.canonicalUrl);
      if (!exists) {
        store.jobs.unshift(job);
        ingestedCount++;
      }
    }

    store.updateCountryJobCounts();

    return res.json({
      success: true,
      message: `Tamil Nadu scan completed. Ingested ${ingestedCount} new opportunities.`,
      newJobsDiscovered: ingestedCount,
      totalTNJobs: store.jobs.filter(j => j.state === 'Tamil Nadu' || (j.location && j.location.includes('Tamil Nadu'))).length
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Tamil Nadu scan encountered an error',
      error: err.message
    });
  }
});

export default router;
