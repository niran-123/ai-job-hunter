import { store } from '../../services/store.js';

export const applicationController = {
  getApplications: (req, res) => {
    // Populate job details
    const populated = store.applications.map(app => {
      const job = store.jobs.find(j => j.id === app.jobId) || {
        title: 'Job Not Found',
        companyName: 'Unknown',
        location: 'Unknown'
      };
      return {
        ...app,
        job
      };
    });
    return res.json({ success: true, data: populated });
  },

  createApplication: (req, res) => {
    const { jobId, status = 'APPLIED', notes = '' } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, error: 'jobId is required' });
    }

    const existingIndex = store.applications.findIndex(a => a.jobId === jobId);
    if (existingIndex >= 0) {
      store.applications[existingIndex].status = status;
      store.applications[existingIndex].notes = notes;
      store.applications[existingIndex].updatedAt = new Date().toISOString();
      return res.json({ success: true, data: store.applications[existingIndex] });
    }

    const newApp = {
      id: `app_${Date.now()}`,
      userId: req.user?.id || 'usr_default',
      jobId,
      status, // SAVED, APPLIED, INTERVIEW, SELECTED, REJECTED, WITHDRAWN
      appliedAt: status === 'APPLIED' ? new Date().toISOString() : null,
      interviewDate: null,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.applications.push(newApp);

    return res.status(201).json({ success: true, data: newApp });
  },

  updateApplication: (req, res) => {
    const { id } = req.params;
    const { status, notes, interviewDate } = req.body;

    const app = store.applications.find(a => a.id === id || a.jobId === id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application record not found' });
    }

    if (status) {
      app.status = status;
      if (status === 'APPLIED' && !app.appliedAt) {
        app.appliedAt = new Date().toISOString();
      }
    }
    if (notes !== undefined) app.notes = notes;
    if (interviewDate !== undefined) app.interviewDate = interviewDate;
    app.updatedAt = new Date().toISOString();

    return res.json({ success: true, data: app });
  }
};

