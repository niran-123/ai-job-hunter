import { store } from '../../services/store.js';

export const jobController = {
  getJobs: (req, res) => {
    let {
      page = 1,
      limit = 20,
      search = '',
      country = '',
      jobCategory = '',
      employmentType = '',
      workplaceType = '',
      experienceMax = '',
      minMatchScore = '',
      eligibilityStatus = '',
      status = '',
      sortBy = 'discoveredAt',
      sortOrder
    } = req.query;

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 20;

    // Default sort order: deadline/closingSoon defaults to 'asc' (soonest first), others default to 'desc'
    const isDeadlineSort = ['closingSoon', 'expiresAt', 'deadline'].includes(sortBy);
    const effectiveSortOrder = sortOrder || (isDeadlineSort ? 'asc' : 'desc');

    let filtered = [...store.jobs];

    // Search query filter (matches title, company, description, required skills)
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(j =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.companyName || '').toLowerCase().includes(q) ||
        (j.description || '').toLowerCase().includes(q) ||
        (j.requiredSkills || []).some(s => s.toLowerCase().includes(q))
      );
    }

    // Country filter
    if (country) {
      filtered = filtered.filter(j =>
        (j.country || '').toLowerCase() === country.toLowerCase() ||
        (j.countryCode || '').toLowerCase() === country.toLowerCase()
      );
    }

    // Job category filter
    if (jobCategory) {
      filtered = filtered.filter(j =>
        (j.jobCategory || '').toLowerCase() === jobCategory.toLowerCase()
      );
    }

    // Employment type filter
    if (employmentType) {
      filtered = filtered.filter(j =>
        (j.employmentType || '').toLowerCase() === employmentType.toLowerCase()
      );
    }

    // Workplace type filter
    if (workplaceType) {
      filtered = filtered.filter(j =>
        (j.workplaceType || '').toLowerCase() === workplaceType.toLowerCase()
      );
    }

    // Experience filter (<= max years)
    if (experienceMax) {
      const exp = parseFloat(experienceMax);
      filtered = filtered.filter(j => (j.experienceMax ?? j.mandatoryExperience ?? 0) <= exp);
    }

    // Match score filter (for user ranking exploration)
    if (minMatchScore) {
      const score = parseFloat(minMatchScore);
      filtered = filtered.filter(j => (j.analysis?.matchScore ?? j.matchScore ?? 0) >= score);
    }

    // Eligibility status filter (ELIGIBLE, INELIGIBLE, NEEDS_REVIEW)
    if (eligibilityStatus) {
      filtered = filtered.filter(j => j.eligibilityStatus === eligibilityStatus);
    }

    // Job status filter (ACTIVE, EXPIRED, CLOSED, etc.)
    if (status) {
      filtered = filtered.filter(j => j.status === status);
    }

    // Sorting
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'matchScore') {
        valA = a.analysis?.matchScore ?? a.matchScore ?? 0;
        valB = b.analysis?.matchScore ?? b.matchScore ?? 0;
      } else if (sortBy === 'postedAt' || sortBy === 'discoveredAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (isDeadlineSort) {
        const now = Date.now();
        const timeA = new Date(a.expiresAt || a.applicationDeadline || 0).getTime();
        const timeB = new Date(b.expiresAt || b.applicationDeadline || 0).getTime();
        
        // Determine buckets: 1 = active upcoming, 2 = no deadline, 3 = already expired
        const bucketA = timeA <= 0 ? 2 : timeA < now ? 3 : 1;
        const bucketB = timeB <= 0 ? 2 : timeB < now ? 3 : 1;

        if (bucketA !== bucketB) {
          return effectiveSortOrder === 'asc' ? bucketA - bucketB : bucketB - bucketA;
        }

        valA = timeA || (effectiveSortOrder === 'asc' ? 9999999999999 : 0);
        valB = timeB || (effectiveSortOrder === 'asc' ? 9999999999999 : 0);
      }

      if (valA < valB) return effectiveSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return effectiveSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      data: {
        jobs: paginated,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  },

  getJobById: (req, res) => {
    const { id } = req.params;
    const job = store.jobs.find(j => j.id === id || j.externalId === id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    return res.json({ success: true, data: job });
  },

  getRecentJobs: (req, res) => {
    const { country, limit = 20 } = req.query;
    let recent = [...store.jobs]
      .filter(j => j.eligibilityStatus === 'ELIGIBLE' && j.status === 'ACTIVE');
    if (country) {
      const c = country.toLowerCase();
      recent = recent.filter(j =>
        (j.country || '').toLowerCase() === c ||
        (j.countryCode || '').toLowerCase() === c
      );
    }
    recent = recent
      .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
      .slice(0, parseInt(limit, 10) || 20);
    return res.json({ success: true, data: recent });
  },

  getRecommendedJobs: (req, res) => {
    // Top AI recommendations sorted by profile match score
    const { country, limit = 20 } = req.query;
    let recommended = [...store.jobs]
      .filter(j => j.eligibilityStatus === 'ELIGIBLE' && j.status === 'ACTIVE');
    if (country) {
      const c = country.toLowerCase();
      recommended = recommended.filter(j =>
        (j.country || '').toLowerCase() === c ||
        (j.countryCode || '').toLowerCase() === c
      );
    }
    recommended = recommended
      .sort((a, b) => (b.analysis?.matchScore || 0) - (a.analysis?.matchScore || 0))
      .slice(0, parseInt(limit, 10) || 20);
    return res.json({ success: true, data: recommended });
  },

  searchJobs: (req, res) => {
    return jobController.getJobs(req, res);
  },

  updateJobStatus: (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    const job = store.jobs.find(j => j.id === id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const oldStatus = job.status;
    job.status = status;
    job.verifiedAt = new Date().toISOString();

    return res.json({
      success: true,
      data: {
        id: job.id,
        oldStatus,
        newStatus: job.status,
        reason: reason || 'Manual status update',
        updatedAt: job.verifiedAt
      }
    });
  }
};

