import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  Bookmark,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
  ShieldCheck,
  Search,
  RotateCcw,
  IndianRupee,
  ChevronRight,
  Bot,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import api from '../services/api';

const STARTUP_COMPANIES = new Set([
  'paytm', 'cred', 'meesho', 'groww', 'zeta',
  'zoho corporation', 'freshworks', 'chargebee', 'kissflow', 'kovai.co', 'soliton technologies', 'gofrugal', 'contus'
]);

/**
 * Calculates human-readable deadline information and urgency status.
 */
function getDeadlineInfo(dateStr) {
  if (!dateStr) {
    return {
      text: 'Open (No fixed deadline)',
      urgency: 'none',
      daysLeft: null,
      dateFormatted: ''
    };
  }
  const deadline = new Date(dateStr);
  if (isNaN(deadline.getTime())) {
    return {
      text: 'Open (No fixed deadline)',
      urgency: 'none',
      daysLeft: null,
      dateFormatted: ''
    };
  }

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const dateFormatted = deadline.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (diffMs <= 0) {
    return {
      text: `Closed on ${dateFormatted}`,
      urgency: 'expired',
      daysLeft: -1,
      dateFormatted
    };
  }

  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours <= 12) {
    return {
      text: `Closing in ${diffHours} hours! (${dateFormatted})`,
      urgency: 'urgent',
      daysLeft: 0,
      dateFormatted
    };
  }
  if (diffDays <= 1) {
    return {
      text: `Closing tomorrow! (${dateFormatted})`,
      urgency: 'urgent',
      daysLeft: 1,
      dateFormatted
    };
  }
  if (diffDays <= 3) {
    return {
      text: `Closing in ${diffDays} days (${dateFormatted})`,
      urgency: 'urgent',
      daysLeft: diffDays,
      dateFormatted
    };
  }
  if (diffDays <= 7) {
    return {
      text: `Closing in ${diffDays} days (${dateFormatted})`,
      urgency: 'warning',
      daysLeft: diffDays,
      dateFormatted
    };
  }
  return {
    text: `Deadline: ${dateFormatted} (${diffDays} days left)`,
    urgency: 'normal',
    daysLeft: diffDays,
    dateFormatted
  };
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [agentStatus, setAgentStatus] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [companyTypeFilter, setCompanyTypeFilter] = useState('');
  const [onlyClosingSoon, setOnlyClosingSoon] = useState(false);
  const [sortBy, setSortBy] = useState('closingSoon');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [jobsRes, agentRes, savedRes] = await Promise.all([
        api.get('/jobs?country=India&eligibilityStatus=ELIGIBLE&status=ACTIVE&limit=100').catch(err => {
          console.warn('Jobs fetch error, check if server is running on port 5000', err);
          return { data: { data: { jobs: [] } } };
        }),
        api.get('/agent/status').catch(() => ({ data: { data: null } })),
        api.get('/saved-jobs').catch(() => ({ data: { data: [] } }))
      ]);

      setJobs(jobsRes.data?.data?.jobs || []);
      setAgentStatus(agentRes.data?.data || null);
      const savedIds = new Set((savedRes.data?.data || []).map(j => j.id));
      setSavedJobIds(savedIds);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleScanNow = async () => {
    setScanning(true);
    try {
      await api.post('/agent/scan');
      // Background scan takes ~2 seconds to probe Greenhouse & Lever
      setTimeout(() => {
        fetchDashboardData();
        setScanning(false);
      }, 2500);
    } catch (err) {
      console.error('Scan trigger error', err);
      setScanning(false);
    }
  };

  const toggleSave = async (jobId) => {
    try {
      if (savedJobIds.has(jobId)) {
        await api.delete(`/saved-jobs/${jobId}`);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await api.post('/saved-jobs', { jobId });
        setSavedJobIds(prev => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Save toggle failed', err);
    }
  };

  // Filter & sort active available jobs in memory for instant responsiveness
  const filteredJobs = useMemo(() => {
    const now = Date.now();

    return jobs
      .filter(job => {
        // Only include active and non-expired opportunities
        if (job.status && job.status !== 'ACTIVE') return false;
        const expTime = job.expiresAt || job.applicationDeadline || job.closingDate;
        if (expTime) {
          const deadlineMs = new Date(expTime).getTime();
          if (!isNaN(deadlineMs) && deadlineMs < now) return false;
        }

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = (job.title || '').toLowerCase().includes(q);
          const matchCompany = (job.companyName || '').toLowerCase().includes(q);
          const matchCity = (job.city || job.location || '').toLowerCase().includes(q);
          const matchSkills = (job.requiredSkills || []).some(s => s.toLowerCase().includes(q));
          if (!matchTitle && !matchCompany && !matchCity && !matchSkills) return false;
        }

        // Experience filter
        if (experienceFilter === 'fresher') {
          const minExp = job.experienceMin ?? job.mandatoryExperience ?? 0;
          if (minExp > 0) return false;
        } else if (experienceFilter === '1yr') {
          const maxExp = job.experienceMax ?? job.mandatoryExperience ?? 0;
          if (maxExp > 1) return false;
        } else if (experienceFilter === '2yr') {
          const maxExp = job.experienceMax ?? job.mandatoryExperience ?? 0;
          if (maxExp > 2) return false;
        }

        // City & State filter with smart regional matching across India & Tamil Nadu
        if (cityFilter) {
          const jobCity = (job.city || job.location || '').toLowerCase();
          const jobLoc = (job.location || '').toLowerCase();
          const jobState = (job.state || '').toLowerCase();

          if (cityFilter === 'tamilnadu_all') {
            if (
              !jobLoc.includes('tamil nadu') &&
              !jobState.includes('tamil nadu') &&
              !jobCity.includes('chennai') &&
              !jobCity.includes('coimbatore') &&
              !jobCity.includes('madurai') &&
              !jobCity.includes('trichy') &&
              !jobCity.includes('salem') &&
              !jobCity.includes('tenkasi') &&
              !jobCity.includes('tirunelveli')
            ) {
              return false;
            }
          } else if (cityFilter === 'chennai') {
            if (!jobCity.includes('chennai') && !jobLoc.includes('chennai')) return false;
          } else if (cityFilter === 'coimbatore') {
            if (!jobCity.includes('coimbatore') && !jobLoc.includes('coimbatore')) return false;
          } else if (cityFilter === 'madurai') {
            if (!jobCity.includes('madurai') && !jobLoc.includes('madurai')) return false;
          } else if (cityFilter === 'trichy_salem') {
            if (!jobCity.includes('trichy') && !jobLoc.includes('trichy') && !jobCity.includes('salem') && !jobLoc.includes('salem')) return false;
          } else if (cityFilter === 'noida_delhi') {
            if (
              !jobCity.includes('noida') &&
              !jobCity.includes('delhi') &&
              !jobCity.includes('gurgaon') &&
              !jobCity.includes('gurugram') &&
              !jobCity.includes('ncr')
            ) {
              return false;
            }
          } else if (cityFilter === 'remote') {
            if (!jobCity.includes('remote') && job.workplaceType !== 'Remote') {
              return false;
            }
          } else {
            if (!jobCity.includes(cityFilter.toLowerCase())) return false;
          }
        }

        // Company Type Filter: Startups vs MNCs
        if (companyTypeFilter === 'startup') {
          const comp = (job.companyName || '').toLowerCase();
          if (!STARTUP_COMPANIES.has(comp)) return false;
        } else if (companyTypeFilter === 'mnc') {
          const comp = (job.companyName || '').toLowerCase();
          if (STARTUP_COMPANIES.has(comp)) return false;
        }

        // Only closing soon (< 5 days)
        if (onlyClosingSoon) {
          const expMs = new Date(job.expiresAt || job.applicationDeadline || 0).getTime();
          const fiveDays = 5 * 24 * 60 * 60 * 1000;
          if (expMs <= now || expMs > now + fiveDays) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'closingSoon') {
          const nowMs = Date.now();
          const timeA = new Date(a.expiresAt || a.applicationDeadline || 0).getTime();
          const timeB = new Date(b.expiresAt || b.applicationDeadline || 0).getTime();

          const hasDeadA = timeA > nowMs;
          const hasDeadB = timeB > nowMs;

          if (hasDeadA && hasDeadB) return timeA - timeB; // Soonest deadline first
          if (hasDeadA && !hasDeadB) return -1; // Specific deadline before open
          if (!hasDeadA && hasDeadB) return 1;
          return 0;
        }
        if (sortBy === 'matchScore') {
          const scoreA = a.analysis?.matchScore ?? a.matchScore ?? 0;
          const scoreB = b.analysis?.matchScore ?? b.matchScore ?? 0;
          return scoreB - scoreA;
        }
        if (sortBy === 'discoveredAt') {
          const dateA = new Date(a.discoveredAt || 0).getTime();
          const dateB = new Date(b.discoveredAt || 0).getTime();
          return dateB - dateA;
        }
        return 0;
      });
  }, [jobs, search, experienceFilter, cityFilter, companyTypeFilter, onlyClosingSoon, sortBy]);

  // Derived metrics for summary cards (based strictly on available non-expired jobs)
  const now = Date.now();
  const availableIndiaJobs = jobs.filter(j => {
    if (j.status && j.status !== 'ACTIVE') return false;
    const exp = new Date(j.expiresAt || j.applicationDeadline || 0).getTime();
    return !exp || exp > now;
  });

  const totalIndiaJobs = availableIndiaJobs.length;
  const closingSoonCount = availableIndiaJobs.filter(j => {
    const exp = new Date(j.expiresAt || j.applicationDeadline || 0).getTime();
    return exp > now && exp <= now + 5 * 24 * 60 * 60 * 1000;
  }).length;
  const highMatchCount = availableIndiaJobs.filter(j => (j.analysis?.matchScore || 0) >= 80).length;
  const savedCount = savedJobIds.size;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading Fresher Jobs in India...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Clean, Focused Header with Agent Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              🇮🇳 India Only &bull; 0–2 Yrs Experience Target
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100" title="Background worker scans Greenhouse & Lever every 30 minutes (48 times a day)">
              <Bot className="w-3 h-3 text-indigo-600" />
              Continuous Scanner: Active (Scans Every 30 Mins Daily)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              Daily Email Digest at 08:00 AM IST
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Fresher & Entry-Level Jobs Across India
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified opportunities for 0–2 years experience across Tamil Nadu tech hubs (Chennai, Coimbatore, Madurai, Trichy, Salem with 7,500+ IT firms), Indian SaaS giants (Zoho, Freshworks, Kovai.co) & global tech MNCs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleScanNow}
            disabled={scanning}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition disabled:opacity-50"
            title="Trigger an immediate live scan across all company portals"
          >
            <Bot className={`w-3.5 h-3.5 ${scanning ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
            {scanning ? 'Scanning Portals...' : 'Scan Portals Now'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
            title="Refresh job feed"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/jobs?country=India"
            className="flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            Explore All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Decluttered 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Jobs in India */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available in India</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalIndiaJobs}</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3 h-3" /> 100% Eligible (0–2 Yrs)
          </span>
        </div>

        {/* Card 2: Closing Soon */}
        <div
          onClick={() => setOnlyClosingSoon(!onlyClosingSoon)}
          className={`cursor-pointer rounded-xl border p-4 shadow-xs transition ${
            onlyClosingSoon
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Closing Soon (≤ 5 Days)</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">{closingSoonCount}</div>
          <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 mt-1">
            {onlyClosingSoon ? 'Filtering active (click to clear)' : 'Urgent deadlines to apply'}
          </span>
        </div>

        {/* Card 3: High AI Match */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">High Match (≥80%)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{highMatchCount}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Top aligned with your skills
          </span>
        </div>

        {/* Card 4: Saved Jobs */}
        <Link
          to="/saved"
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-indigo-200 hover:shadow-sm transition block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saved Jobs</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{savedCount}</div>
          <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
            View saved list <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company, skill (e.g. React, Razorpay, Bengaluru)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Experience level */}
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Experience: All Entry (0–2 Yrs)</option>
              <option value="fresher">Freshers Only (0 Yrs Exp)</option>
              <option value="1yr">Up to 1 Year (0–1 Yr)</option>
              <option value="2yr">Up to 2 Years (0–2 Yrs)</option>
            </select>

            {/* City */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Indian Cities</option>
              <option value="tamilnadu_all">🌴 All Tamil Nadu Hubs (7,000+ Cos)</option>
              <option value="chennai">Chennai (OMR, Siruseri, Tidel)</option>
              <option value="coimbatore">Coimbatore (Saravanampatti, Tidel)</option>
              <option value="madurai">Madurai (Vadapalanji SEZ)</option>
              <option value="trichy_salem">Trichy & Salem (Navalpattu, Steel Plant)</option>
              <option value="bengaluru">Bengaluru (Karnataka)</option>
              <option value="noida_delhi">Delhi NCR / Noida / Gurugram</option>
              <option value="mumbai">Mumbai (Maharashtra)</option>
              <option value="pune">Pune (Maharashtra)</option>
              <option value="hyderabad">Hyderabad (Telangana)</option>
              <option value="remote">Remote (Pan-India)</option>
            </select>

            {/* Tamil Nadu Quick Filter Toggle */}
            <button
              onClick={() => setCityFilter(cityFilter === 'tamilnadu_all' ? '' : 'tamilnadu_all')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                cityFilter === 'tamilnadu_all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              🌴 Tamil Nadu (7,500+ Cos)
            </button>

            {/* Company Type (Startups vs MNCs) */}
            <select
              value={companyTypeFilter}
              onChange={(e) => setCompanyTypeFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Companies (Startups & MNCs)</option>
              <option value="startup">🚀 Startups & Unicorns Only</option>
              <option value="mnc">🏢 Global Tech & MNCs Only</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="closingSoon">⏳ Closing Soonest (Deadline)</option>
              <option value="matchScore">⭐ Highest AI Match</option>
              <option value="discoveredAt">🕒 Newest Discovered</option>
            </select>

            {/* Closing soon toggle button */}
            <button
              onClick={() => setOnlyClosingSoon(!onlyClosingSoon)}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                onlyClosingSoon
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {onlyClosingSoon ? 'Showing Urgent Deadlines' : 'Urgent Only (≤ 5 Days)'}
            </button>
          </div>
        </div>

        {/* Active filter summary pill */}
        {(search || experienceFilter || cityFilter || companyTypeFilter || onlyClosingSoon) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing <strong>{filteredJobs.length}</strong> of <strong>{totalIndiaJobs}</strong> available jobs matching filters
            </span>
            <button
              onClick={() => {
                setSearch('');
                setExperienceFilter('');
                setCityFilter('');
                setCompanyTypeFilter('');
                setOnlyClosingSoon(false);
                setSortBy('closingSoon');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Available Jobs in India Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Available Jobs in India
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredJobs.length} Available
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Sorted by nearest application deadline
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No jobs match your filter criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try clearing the search text or loosening experience/city filters to see more fresher opportunities in India.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setExperienceFilter('');
                setCityFilter('');
                setCompanyTypeFilter('');
                setOnlyClosingSoon(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => {
              const isSaved = savedJobIds.has(job.id);
              const score = Math.round(job.analysis?.matchScore || job.matchScore || 80);
              const deadline = getDeadlineInfo(job.expiresAt || job.applicationDeadline || job.closingDate);
              const isStartup = STARTUP_COMPANIES.has((job.companyName || '').toLowerCase());
              const isTamilNadu =
                (job.state || '').toLowerCase().includes('tamil nadu') ||
                (job.location || '').toLowerCase().includes('tamil nadu') ||
                (job.city || '').toLowerCase().includes('chennai') ||
                (job.city || '').toLowerCase().includes('coimbatore') ||
                (job.city || '').toLowerCase().includes('madurai') ||
                (job.city || '').toLowerCase().includes('trichy') ||
                (job.city || '').toLowerCase().includes('salem');

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition duration-150 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Job Info */}
                    <div className="space-y-2 flex-1">
                      {/* Top Badges: Category, Company Type, Experience */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {job.jobCategory || 'Software Engineering'}
                        </span>

                        {isTamilNadu && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            🌴 Tamil Nadu Hub
                          </span>
                        )}

                        {isStartup ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            <Rocket className="w-2.5 h-2.5 text-purple-600" /> Startup / Scaleup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            <Building2 className="w-2.5 h-2.5 text-blue-600" /> MNC / Global Tech
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          {job.experienceMin === 0 && (job.experienceMax === 0 || job.mandatoryExperience === 0)
                            ? 'Fresher / Early Career (0–1 Yr)'
                            : `0–${job.experienceMax || 2} Yrs Experience`}
                        </span>

                        <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                          {job.workplaceType || 'Hybrid'} &bull; {job.employmentType || 'Full-time'}
                        </span>
                      </div>

                      {/* Job Title */}
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-base lg:text-lg font-bold text-slate-900 hover:text-indigo-600 transition block"
                      >
                        {job.title}
                      </Link>

                      {/* Company & Location in India */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          {job.companyName}
                        </span>

                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location || `${job.city || 'Bengaluru'}, India`}
                        </span>

                        {job.salaryMin && (
                          <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <IndianRupee className="w-3 h-3" />
                            {job.salaryMin >= 100000
                              ? `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L / yr`
                              : `₹${job.salaryMin.toLocaleString()} – ₹${job.salaryMax?.toLocaleString()} ${job.currency || 'INR'}`}
                          </span>
                        )}
                      </div>

                      {/* Brief description / AI Summary */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                        {job.analysis?.jobSummary || job.description}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {(job.requiredSkills || []).slice(0, 5).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Prominent Closing Time, AI Match & Apply Button */}
                    <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0 md:min-w-[240px] pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* PROMINENT CLOSING TIME / DEADLINE */}
                      <div className="w-full md:text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Application Deadline
                        </div>
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            deadline.urgency === 'urgent'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                              : deadline.urgency === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${
                            deadline.urgency === 'urgent'
                              ? 'text-rose-600'
                              : deadline.urgency === 'warning'
                              ? 'text-amber-600'
                              : 'text-indigo-600'
                          }`} />
                          <span>{deadline.text}</span>
                        </div>
                      </div>

                      {/* AI Match Score */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">AI Match:</span>
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            score >= 90
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : score >= 80
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {score}% Match
                        </span>
                      </div>

                      {/* Direct Apply & Save Actions */}
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                          onClick={() => toggleSave(job.id)}
                          className={`p-2 rounded-xl border transition ${
                            isSaved
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                          }`}
                          title={isSaved ? 'Remove from saved' : 'Save opportunity'}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>

                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition"
                        >
                          Apply Now <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
