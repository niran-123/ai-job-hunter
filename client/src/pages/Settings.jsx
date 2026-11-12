import React, { useState, useEffect } from 'react';
import { Sliders, ShieldCheck, Save, Clock, Cpu, Check } from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    agentActive: true,
    scanFrequencyMinutes: 30,
    dailyDigestTime: '08:00',
    timezone: 'Asia/Kolkata',
    maxExperienceYears: 2,
    aiProvider: 'gemini',
    enableNoNewJobsEmail: false
  });
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data?.data) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      setSavedMessage('Settings saved successfully.');
      setTimeout(() => setSavedMessage(''), 3000);
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
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agent & Platform Settings</h1>
          <p className="text-sm text-slate-500">
            Configure automated scan frequency, notification dispatch timings, and AI intelligence provider.
          </p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          {savedMessage}
        </div>
      )}

      {/* Experience Policy Guard */}
      <div className="bg-indigo-950 text-indigo-100 rounded-2xl p-6 border border-indigo-800 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Experience Policy Guard</h2>
        </div>
        <p className="text-xs text-indigo-200 leading-relaxed">
          The strict project policy limits accepted experience to a maximum of <strong>2 years</strong> (fresher, 0-1, 0-2, internships, graduate trainees). Any opportunity requiring 3+ years mandatory experience is deterministically rejected before AI analysis.
        </p>
        <div className="inline-flex items-center gap-2 bg-indigo-900/60 px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-indigo-700">
          Max Experience Cap: {settings.maxExperienceYears} Years (Fixed)
        </div>
      </div>

      {/* Background Scheduling */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Discovery & Scan Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Scan Interval (Minutes)</label>
            <select
              value={settings.scanFrequencyMinutes || 30}
              onChange={(e) => setSettings({ ...settings, scanFrequencyMinutes: parseInt(e.target.value, 10) })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="15">Every 15 Minutes</option>
              <option value="30">Every 30 Minutes (Recommended)</option>
              <option value="60">Every 1 Hour</option>
              <option value="120">Every 2 Hours</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Agent Operational Status</label>
            <select
              value={settings.agentActive ? 'true' : 'false'}
              onChange={(e) => setSettings({ ...settings, agentActive: e.target.value === 'true' })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Continuous Discovery Active</option>
              <option value="false">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Provider Config */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">AI Provider Modular Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Selected AI Engine</label>
            <select
              value={settings.aiProvider || 'gemini'}
              onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="gemini">Google Gemini 1.5 Flash (Default)</option>
              <option value="openai">OpenAI GPT-4o Mini</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Digest Time (Daily Dispatch)</label>
            <input
              type="time"
              value={settings.dailyDigestTime || '08:00'}
              onChange={(e) => setSettings({ ...settings, dailyDigestTime: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

