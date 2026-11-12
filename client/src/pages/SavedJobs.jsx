import React, { useState, useEffect } from 'react';
import { Bookmark, ExternalLink, Trash2, ArrowUpRight, Building2, MapPin } from 'lucide-react';
import api from '../services/api';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await api.get('/saved-jobs');
      setSavedJobs(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const removeJob = async (id) => {
    try {
      await api.delete(`/saved-jobs/${id}`);
      setSavedJobs(prev => prev.filter(j => j.id !== id));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Opportunities</h1>
          <p className="text-sm text-slate-500">
            Bookmarked positions for your review and manual application.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">
          {savedJobs.length} Saved
        </div>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">No Saved Jobs Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse discovered opportunities and click the bookmark button to save them here.
          </p>
          <a
            href="/jobs"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Explore Jobs
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-1">
                <a href={`/jobs/${job.id}`} className="text-base font-bold text-slate-900 hover:text-indigo-600 transition">
                  {job.title}
                </a>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.companyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                  </span>
                  <span>{job.employmentType}</span>
                  <span className="font-bold text-emerald-700">
                    {Math.round(job.analysis?.matchScore || 75)}% Match
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  Apply <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => removeJob(job.id)}
                  className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

