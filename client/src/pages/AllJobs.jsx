import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import api from '../services/api';

function getDeadlinePill(dateStr) {
  if (!dateStr) return { text: 'Open', urgency: 'none' };
  const deadline = new Date(dateStr);
  if (isNaN(deadline.getTime())) return { text: 'Open', urgency: 'none' };
  const diffMs = deadline.getTime() - Date.now();
  if (diffMs <= 0) return { text: 'Closed', urgency: 'expired' };
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return { text: 'Closing tomorrow!', urgency: 'urgent' };
  if (diffDays <= 3) return { text: `Closes in ${diffDays}d`, urgency: 'urgent' };
  if (diffDays <= 7) return { text: `Closes in ${diffDays}d`, urgency: 'warning' };
  return { text: `Closes in ${diffDays}d`, urgency: 'normal' };
}

export default function AllJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('India');
  const [category, setCategory] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workplaceType, setWorkplaceType] = useState('');
  const [eligibilityStatus, setEligibilityStatus] = useState('');
  const [minMatchScore, setMinMatchScore] = useState('');
  const [sortBy, setSortBy] = useState('discoveredAt');

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        country,
        jobCategory: category,
        employmentType,
        workplaceType,
        eligibilityStatus,
        minMatchScore,
        sortBy
      });

      const [jobsRes, savedRes] = await Promise.all([
        api.get(`/jobs?${params.toString()}`).catch(() => ({ data: { data: { jobs: [], pagination: {} } } })),
        api.get('/saved-jobs').catch(() => ({ data: { data: [] } }))
      ]);

      setJobs(jobsRes.data?.data?.jobs || []);
      setPagination(jobsRes.data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      const savedIds = new Set((savedRes.data?.data || []).map(j => j.id));
      setSavedJobIds(savedIds);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [country, category, employmentType, workplaceType, eligibilityStatus, minMatchScore, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(1);
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
      console.error('Save job toggle failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discovered Opportunities</h1>
          <p className="text-sm text-slate-500">
            Automated IT job discovery across Greenhouse, Lever, and official feeds. Every eligible job is retained regardless of match score.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 self-start md:self-auto">
          Showing {pagination.total} opportunities
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, required skills (e.g. React, Python), or company..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="India">🇮🇳 India (Default)</option>
            <option value="">All Countries</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="Singapore">Singapore</option>
          </select>

          <select
            value={workplaceType}
            onChange={(e) => setWorkplaceType(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="">Workplace Type</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>

          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="">Employment Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Graduate trainee">Graduate Trainee</option>
          </select>

          <select
            value={eligibilityStatus}
            onChange={(e) => setEligibilityStatus(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="">Eligibility Status</option>
            <option value="ELIGIBLE">Eligible (0-2 Yrs)</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="INELIGIBLE">Ineligible (&gt;2 Yrs)</option>
          </select>

          <select
            value={minMatchScore}
            onChange={(e) => setMinMatchScore(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="">Min Match Score</option>
            <option value="80">80%+ (High Match)</option>
            <option value="60">60%+ (Good Match)</option>
            <option value="40">40%+ (Any Match)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="closingSoon">⏳ Closing Soonest (Deadline)</option>
            <option value="discoveredAt">Newest Discovered</option>
            <option value="matchScore">Highest AI Match</option>
            <option value="postedAt">Original Posted Date</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 font-medium">No opportunities match the selected criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job.id);
            const score = Math.round(job.analysis?.matchScore || job.matchScore || 50);
            const isEligible = job.eligibilityStatus === 'ELIGIBLE';

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Job Details Left */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition"
                      >
                        {job.title}
                      </Link>

                      {/* Eligibility Badge */}
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> Eligible (0-2 Yrs)
                        </span>
                      ) : job.eligibilityStatus === 'NEEDS_REVIEW' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Ineligible (&gt;2 Yrs)
                        </span>
                      )}

                      {/* Application Deadline Badge */}
                      {(() => {
                        const dl = getDeadlinePill(job.expiresAt || job.applicationDeadline || job.closingDate);
                        return (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            dl.urgency === 'urgent'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                              : dl.urgency === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {dl.text}
                          </span>
                        );
                      })()}

                      {/* Source attribution tag */}
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        {job.source?.type || 'VERIFIED FEED'}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1 text-slate-800 font-bold">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.companyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location} &bull; {job.workplaceType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.employmentType}
                      </span>
                      {job.salaryMin && (
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          {job.currency === 'INR' || job.countryCode === 'IN' || job.country === 'India' ? (
                            <>
                              <IndianRupee className="w-3 h-3" />
                              {job.salaryMin >= 100000
                                ? `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L / yr`
                                : `₹${job.salaryMin.toLocaleString()} – ₹${job.salaryMax?.toLocaleString()}`}
                            </>
                          ) : (
                            `$${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString()} ${job.currency || 'USD'}`
                          )}
                        </span>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {job.analysis?.jobSummary || job.description}
                    </p>

                    {/* Required Skills tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(job.requiredSkills || []).slice(0, 6).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Actions & Score */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">AI Match:</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          score >= 80
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : score >= 60
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {score}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSave(job.id)}
                        className={`p-2 rounded-lg border transition ${
                          isSaved
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save job'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>

                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                      >
                        Apply <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchJobs(pagination.page - 1)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-medium text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchJobs(pagination.page + 1)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 disabled:opacity-40 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

