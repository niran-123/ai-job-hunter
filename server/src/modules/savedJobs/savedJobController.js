import { store } from '../../services/store.js';

export const savedJobController = {
  getSavedJobs: (req, res) => {
    const savedJobIds = Array.from(store.savedJobs);
    const jobs = store.jobs.filter(j => savedJobIds.includes(j.id));
    return res.json({ success: true, data: jobs });
  },

  saveJob: (req, res) => {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, error: 'jobId is required' });
    }
    const exists = store.jobs.some(j => j.id === jobId);
    if (!exists) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    store.savedJobs.add(jobId);
    return res.status(201).json({ success: true, message: 'Job saved successfully', jobId });
  },

  removeSavedJob: (req, res) => {
    const { id } = req.params;
    store.savedJobs.delete(id);
    return res.json({ success: true, message: 'Job removed from saved list', jobId: id });
  }
};

