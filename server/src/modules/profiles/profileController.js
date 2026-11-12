import { store } from '../../services/store.js';
import { profileMatcher } from '../matching/profileMatcher.js';

export const profileController = {
  getProfile: (req, res) => {
    const profile = store.profiles.find(p => p.userId === req.user?.id) || store.profiles[0];
    return res.json({ success: true, data: profile });
  },

  updateProfile: (req, res) => {
    const userId = req.user?.id || 'usr_default';
    let profile = store.profiles.find(p => p.userId === userId);

    if (!profile) {
      profile = { id: `prof_${Date.now()}`, userId };
      store.profiles.push(profile);
    }

    const allowedFields = [
      'fullName', 'email', 'phone', 'education', 'degree', 'department',
      'college', 'graduationYear', 'cgpaOrPercentage', 'skills',
      'certifications', 'internships', 'projects', 'workExperience',
      'preferredCountries', 'preferredJobCategories', 'preferredEmploymentTypes',
      'resumeUrl'
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        profile[key] = req.body[key];
      }
    }
    profile.updatedAt = new Date().toISOString();

    // Re-evaluate match scores for existing jobs with updated profile
    for (const job of store.jobs) {
      if (job.eligibilityStatus === 'ELIGIBLE') {
        const matchResult = profileMatcher.match(job, profile);
        job.analysis = {
          ...(job.analysis || {}),
          ...matchResult,
          analyzedAt: new Date().toISOString()
        };
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated and match scores refreshed',
      data: profile
    });
  }
};

