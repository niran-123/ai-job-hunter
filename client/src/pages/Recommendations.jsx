import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, HelpCircle, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function Recommendations() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/jobs/recommended');
        setJobs(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load recommended jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> AI Profile Match Ranking
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Recommended Opportunities</h1>
        <p className="text-sm text-slate-500 max-w-3xl">
          Jobs ordered by alignment with your technical skills, education, and internship exposure. Low-scoring eligible jobs remain available in All Jobs.
        </p>
      </div>

      {/* Recommended Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => {
          const analysis = job.analysis || {};
          const score = Math.round(analysis.matchScore || 70);

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 inline mr-1" /> Eligible (0-2 Yrs)
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {job.jobCategory}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    <a href={`/jobs/${job.id}`} className="hover:text-indigo-600 transition">
                      {job.title}
                    </a>
                  </h2>
                  <div className="text-xs text-slate-600 font-medium">
                    🏢 <strong>{job.companyName}</strong> &bull; 📍 {job.location} &bull; 💼 {job.employmentType}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Match Score</div>
                    <div className="text-xl font-black text-indigo-600">{score}%</div>
                  </div>
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Apply <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* AI Recommendation Quote */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                {analysis.aiRecommendation || 'Strong match with candidate background.'}
              </div>

              {/* Strengths & Missing Skills Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-100">
                  <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matching Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(analysis.matchingSkills || []).map((s, idx) => (
                      <span key={idx} className="bg-white text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-100">
                  <span className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Gaps / Missing
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(analysis.missingSkills || []).length > 0 ? (
                      analysis.missingSkills.map((s, idx) => (
                        <span key={idx} className="bg-white text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">No major gaps identified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

