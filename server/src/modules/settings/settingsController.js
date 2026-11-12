import { store } from '../../services/store.js';

export const settingsController = {
  getSettings: (req, res) => {
    return res.json({ success: true, data: store.settings });
  },

  updateSettings: (req, res) => {
    const allowed = [
      'agentActive', 'scanFrequencyMinutes', 'dailyDigestTime', 'timezone',
      'maxExperienceYears', 'aiProvider', 'enableNoNewJobsEmail',
      'selectedCountries', 'selectedJobCategories', 'selectedEmploymentTypes'
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        store.settings[key] = req.body[key];
      }
    }

    return res.json({
      success: true,
      message: 'System settings saved successfully',
      data: store.settings
    });
  }
};

