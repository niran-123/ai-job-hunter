import React, { useState, useEffect } from 'react';
import { Database, Activity, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSources = async () => {
    try {
      const res = await api.get('/sources');
      setSources(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const toggleSource = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.patch(`/sources/${id}`, { isEnabled: !currentStatus });
      setSources(prev => prev.map(s => (s.id === id ? res.data?.data : s)));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Source Integrations & Health</h1>
          <p className="text-sm text-slate-500">
            Modular collectors retrieving listings from permitted public APIs, feeds, and structured career endpoints.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg self-start md:self-auto">
          All Core Ingestion Feeds Operational
        </div>
      </div>

      {/* Sources Grid */}
      <div className="space-y-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {source.type}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Activity className="w-3 h-3" /> {source.healthStatus}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{source.name}</h2>
              <div className="text-xs text-slate-500 font-mono truncate max-w-xl">
                Base Endpoint: {source.baseUrl}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 font-medium">
                <span>Scan Frequency: <strong>Every {source.scanFrequencyMinutes} mins</strong></span>
                <span>Rate Limit: <strong>{source.rateLimitPerMinute} req/min</strong></span>
                <span>Total Jobs Ingested: <strong>{source.totalJobsCollected}</strong></span>
                <span>Last Scan: <strong>{source.lastSuccessfulScan ? new Date(source.lastSuccessfulScan).toLocaleTimeString() : 'Pending'}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                disabled={updatingId === source.id}
                onClick={() => toggleSource(source.id, source.isEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  source.isEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {source.isEnabled ? 'Source Active' : 'Source Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

