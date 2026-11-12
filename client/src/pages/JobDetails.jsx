import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Share2,
  IndianRupee
} from 'lucide-react';
import api from '../services/api';

function getDeadlineDetails(dateStr) {
  if (!dateStr) return { text: 'Open (No fixed deadline)', urgency: 'none' };
  const deadline = new Date(dateStr);
  if (isNaN(deadline.getTime())) return { text: 'Open (No fixed deadline)', urgency: 'none' };
  const diffMs = deadline.getTime() - Date.now();
  const dateFormatted = deadline.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  if (diffMs <= 0) return { text: `Closed on ${dateFormatted}`, urgency: 'expired' };
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return { text: `Closing tomorrow! (${dateFormatted})`, urgency: 'urgent' };
  if (diffDays <= 3) return { text: `Closing in ${diffDays} days (${dateFormatted})`, urgency: 'urgent' };
  if (diffDays <= 7) return { text: `Closing in ${diffDays} days (${dateFormatted})`, urgency: 'warning' };
  return { text: `Deadline: ${dateFormatted} (${diffDays} days left)`, urgency: 'normal' };
}

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [appStatus, setAppStatus] = useState('SAVED');
  const [appNotes, setAppNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const [jobRes, savedRes, appsRes] = await Promise.all([
          api.get(`/jobs/${id}`).catch(() => ({ data: { data: null } })),
          api.get('/saved-jobs').catch(() => ({ data: { data: [] } })),
          api.get('/applications').catch(() => ({ data: { data: [] } }))
        ]);

        const currentJob = jobRes.data?.data;
        setJob(currentJob);

        const savedIds = new Set((savedRes.data?.data || []).map(j => j.id));
        setIsSaved(savedIds.has(currentJob?.id));

        const existingApp = (appsRes.data?.data || []).find(a => a.jobId === currentJob?.id);
        if (existingApp) {
          setAppStatus(existingApp.status);
          setAppNotes(existingApp.notes || '');
        }
      } catch (err) {
        console.error('Failed to load job details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const toggleSave = async () => {
    if (!job) return;
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${job.id}`);
        setIsSaved(false);
      } else {
        await api.post('/saved-jobs', { jobId: job.id });
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateApplication = async (newStatus) => {
    if (!job) return;
    setAppStatus(newStatus);
    try {
      await api.post('/applications', {
        jobId: job.id,
        status: newStatus,
        notes: appNotes
      });
      setStatusMessage(`Application tracked as ${newStatus}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <h2 className="text-lg font-bold text-slate-800">Job Not Found</h2>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
        >
          Return to Jobs
        </button>
      </div>
    );
  }

  const analysis = job.analysis || {};
  const score = Math.round(analysis.matchScore || 60);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to opportunities
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {job.jobCategory || 'Software Engineering'}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {job.source?.type || 'VERIFIED API'}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                ID: {job.externalId}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 font-medium pt-1">
              <span className="flex items-center gap-1.5 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-indigo-600" />
                {job.companyName}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {job.location} &bull; {job.workplaceType}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {job.employmentType}
              </span>
              {job.salaryMin && (
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  {job.currency === 'INR' || job.countryCode === 'IN' || job.country === 'India' ? (
                    <>
                      <IndianRupee className="w-4 h-4" />
                      {job.salaryMin >= 100000
                        ? `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L / yr`
                        : `₹${job.salaryMin.toLocaleString()} – ₹${job.salaryMax?.toLocaleString()}`}
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.currency || 'USD'}
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Application Deadline Badge */}
            {(() => {
              const dl = getDeadlineDetails(job.expiresAt || job.applicationDeadline || job.closingDate);
              return (
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Application Deadline / Closing Time
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      dl.urgency === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                        : dl.urgency === 'warning'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 ${
                      dl.urgency === 'urgent'
                        ? 'text-rose-600'
                        : dl.urgency === 'warning'
                        ? 'text-amber-600'
                        : 'text-indigo-600'
                    }`} />
                    <span>{dl.text}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Action buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 shrink-0">
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition"
            >
              🚀 Direct Apply Link <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSave}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold transition ${
                  isSaved
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
                {isSaved ? 'Saved' : 'Save Opportunity'}
              </button>

              {job.linkedinPostUrl && (
                <a
                  href={job.linkedinPostUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#0077b5] hover:bg-[#006097] text-white rounded-xl text-xs font-semibold transition"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Eligibility Verification Box */}
        <div className="p-4 rounded-xl border bg-slate-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Eligibility Status: <span className="text-emerald-700">{job.eligibilityStatus}</span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {job.eligibilityReason || 'Candidate meets the strict 0-2 years maximum experience constraint.'}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Discovered: {new Date(job.discoveredAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* AI Analysis and Profile Match Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">AI Profile Match & Gap Analysis</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Weighted Match Score:</span>
            <span
              className={`text-sm font-black px-3 py-1 rounded-full ${
                score >= 80
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : score >= 60
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {score}% Overall Match
            </span>
          </div>
        </div>

        {/* AI Summary and Recommendation */}
        <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 space-y-2">
          <div className="text-xs font-bold text-indigo-900 uppercase tracking-wide">AI Recommendation</div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {analysis.aiRecommendation || 'Job aligns with your foundational skills. Review highlighted technical areas before applying.'}
          </p>
        </div>

        {/* Matching vs Missing Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matching Skills */}
          <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matching Technical Skills
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(analysis.matchingSkills || job.requiredSkills || []).map((skill, idx) => (
                <span key={idx} className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200 shadow-2xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="border border-amber-100 bg-amber-50/30 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase">
              <HelpCircle className="w-4 h-4 text-amber-600" /> Missing / Learnable Skills
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(analysis.missingSkills || []).length > 0 ? (
                analysis.missingSkills.map((skill, idx) => (
                  <span key={idx} className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-amber-800 border border-amber-200 shadow-2xs">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">None identified. Core profile meets all stated requirements.</span>
              )}
            </div>
          </div>
        </div>

        {/* Relevant Projects and Internships */}
        {(analysis.relevantProjects?.length > 0 || analysis.relevantInternships?.length > 0) && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Candidate Background Alignment
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {analysis.relevantProjects?.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800">Relevant Project:</span> {p}
                </div>
              ))}
              {analysis.relevantInternships?.map((i, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800">Relevant Experience:</span> {i}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Application Pipeline Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Manual Application Progress</h2>
            <p className="text-xs text-slate-500">Update your application journey status for this position</p>
          </div>
          {statusMessage && (
            <span className="text-xs font-semibold text-emerald-600 animate-fade-in">{statusMessage}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {['SAVED', 'APPLIED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'].map((st) => (
            <button
              key={st}
              onClick={() => handleUpdateApplication(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                appStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="pt-2">
          <input
            type="text"
            value={appNotes}
            onChange={(e) => setAppNotes(e.target.value)}
            onBlur={() => handleUpdateApplication(appStatus)}
            placeholder="Add personal application notes (e.g. Applied on career portal, referral name...)"
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Full Description Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Complete Job Description</h2>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {job.description}
        </div>

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Key Responsibilities</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
              {job.responsibilities.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

