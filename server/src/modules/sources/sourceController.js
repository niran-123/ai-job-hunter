import { store } from '../../services/store.js';

export const sourceController = {
  getSources: (req, res) => {
    return res.json({ success: true, data: store.sources });
  },

  getSourceById: (req, res) => {
    const { id } = req.params;
    const source = store.sources.find(s => s.id === id);
    if (!source) return res.status(404).json({ success: false, error: 'Source not found' });
    return res.json({ success: true, data: source });
  },

  updateSource: (req, res) => {
    const { id } = req.params;
    const source = store.sources.find(s => s.id === id);
    if (!source) return res.status(404).json({ success: false, error: 'Source not found' });

    const { isEnabled, scanFrequencyMinutes, rateLimitPerMinute } = req.body;
    if (isEnabled !== undefined) source.isEnabled = Boolean(isEnabled);
    if (scanFrequencyMinutes !== undefined) source.scanFrequencyMinutes = Number(scanFrequencyMinutes);
    if (rateLimitPerMinute !== undefined) source.rateLimitPerMinute = Number(rateLimitPerMinute);

    return res.json({ success: true, data: source });
  },

  getSourceHealth: (req, res) => {
    const summary = store.sources.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      healthStatus: s.healthStatus,
      lastSuccessfulScan: s.lastSuccessfulScan,
      lastFailedScan: s.lastFailedScan,
      lastError: s.lastError,
      totalJobsCollected: s.totalJobsCollected
    }));
    return res.json({ success: true, data: summary });
  }
};

