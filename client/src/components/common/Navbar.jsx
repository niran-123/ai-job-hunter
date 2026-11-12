import React, { useState, useEffect } from 'react';
import { Bell, Search, Play, Pause, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const [agentStatus, setAgentStatus] = useState({ isActive: true });
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await api.get('/agent/status');
      if (res.data?.data) {
        setAgentStatus(res.data.data);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleAgent = async () => {
    try {
      if (agentStatus.isActive) {
        await api.post('/agent/pause');
        setAgentStatus(prev => ({ ...prev, isActive: false }));
      } else {
        await api.post('/agent/start');
        setAgentStatus(prev => ({ ...prev, isActive: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerManualScan = async () => {
    setIsScanning(true);
    setScanMessage('Scan enqueued...');
    try {
      const res = await api.post('/agent/scan');
      setScanMessage('Scan running in background!');
      setTimeout(() => {
        setScanMessage('');
        setIsScanning(false);
      }, 4000);
    } catch (err) {
      setScanMessage('Scan failed to trigger');
      setIsScanning(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search verified jobs, skills, companies..."
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                window.location.href = `/jobs?search=${encodeURIComponent(e.target.value)}`;
              }
            }}
          />
        </div>
      </div>

      {/* Agent Quick Controls & Actions */}
      <div className="flex items-center gap-4">
        {/* Agent Live Status Badge */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium">
          <span className={`w-2.5 h-2.5 rounded-full ${agentStatus.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-slate-700">
            Agent: <strong>{agentStatus.isActive ? 'Automated Scan Active' : 'Paused'}</strong>
          </span>
          <button
            onClick={toggleAgent}
            className="ml-1 p-1 hover:bg-slate-200 rounded text-slate-600 transition"
            title={agentStatus.isActive ? 'Pause Discovery Agent' : 'Start Discovery Agent'}
          >
            {agentStatus.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
        </div>

        {/* Scan Now Trigger */}
        <button
          onClick={triggerManualScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Enqueued...' : 'Scan Sources Now'}
        </button>

        {scanMessage && (
          <span className="text-xs text-indigo-600 font-medium animate-fade-in">{scanMessage}</span>
        )}

        {/* Notification Icon */}
        <a
          href="/notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Daily Digest Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </a>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AJ'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-800">{user?.name || 'Alex Johnson'}</div>
            <div className="text-[10px] text-slate-500 font-medium">0-2 Yrs Fresher Profile</div>
          </div>
        </div>
      </div>
    </header>
  );
}

