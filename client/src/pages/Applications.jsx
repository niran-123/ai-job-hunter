import React, { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle2, XCircle, Calendar, Plus, ExternalLink, ArrowRight } from 'lucide-react';
import api from '../services/api';

const STAGES = ['SAVED', 'APPLIED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'];

const STAGE_COLORS = {
  SAVED: 'border-blue-400 bg-blue-50/50 text-blue-700',
  APPLIED: 'border-indigo-400 bg-indigo-50/50 text-indigo-700',
  INTERVIEW: 'border-purple-400 bg-purple-50/50 text-purple-700',
  SELECTED: 'border-emerald-400 bg-emerald-50/50 text-emerald-700',
  REJECTED: 'border-rose-400 bg-rose-50/50 text-rose-700',
  WITHDRAWN: 'border-slate-400 bg-slate-50/50 text-slate-700'
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const updateStage = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}`, { status: newStatus });
      setApplications(prev =>
        prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a))
      );
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
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manual Application Tracker</h1>
        <p className="text-sm text-slate-500">
          Track interview timelines and submission statuses manually as you apply on direct company portals.
        </p>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const stageApps = applications.filter(a => a.status === stage);

          return (
            <div key={stage} className="bg-slate-100/70 rounded-2xl p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {stage}
                </span>
                <span className="text-xs font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition space-y-2 text-xs"
                  >
                    <div className="font-bold text-slate-900 leading-tight">
                      {app.job?.title || 'Engineering Role'}
                    </div>
                    <div className="text-slate-500 font-medium">
                      {app.job?.companyName || 'Company'} &bull; {app.job?.location || 'Remote'}
                    </div>

                    {app.notes && (
                      <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-600 italic">
                        "{app.notes}"
                      </div>
                    )}

                    {/* Stage Transition Selector */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <select
                        value={app.status}
                        onChange={(e) => updateStage(app.id, e.target.value)}
                        className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded p-1 text-slate-700 focus:outline-none"
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      {app.job?.applicationUrl && (
                        <a
                          href={app.job.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 p-1"
                          title="Open Application Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {stageApps.length === 0 && (
                  <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs text-center p-3">
                    No items in {stage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

