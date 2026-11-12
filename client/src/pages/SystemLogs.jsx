import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [severity, setSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/agent/logs');
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (severity === 'ALL') return true;
    return l.level?.toUpperCase() === severity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit & Operational Logs</h1>
          <p className="text-sm text-slate-500">
            Real-time execution logs across discovery collectors, normalization workers, AI analysis, and Gmail dispatch.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'INFO', 'WARN', 'ERROR'].map(s => (
          <button
            key={s}
            onClick={() => setSeverity(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              severity === s
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-md font-mono text-xs overflow-x-auto">
        <div className="space-y-2">
          {filteredLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-4 py-1.5 border-b border-slate-800/60 hover:bg-slate-800/40 px-2 rounded transition">
              <span className="text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] shrink-0 ${
                  log.level === 'error'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : log.level === 'warn'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {log.level?.toUpperCase()}
              </span>
              <span className="text-indigo-400 font-semibold shrink-0">
                [{log.module}]
              </span>
              <span className="text-slate-300 break-all">
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

