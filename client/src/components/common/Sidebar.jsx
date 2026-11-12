import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Globe,
  Database,
  Bookmark,
  Send,
  Bell,
  User,
  Sliders,
  ScrollText,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'All Jobs', icon: Briefcase },
  { path: '/recommendations', label: 'AI Matches', icon: Sparkles },
  { path: '/countries', label: 'Country Explorer', icon: Globe },
  { path: '/sources', label: 'Job Sources', icon: Database },
  { path: '/saved', label: 'Saved Jobs', icon: Bookmark },
  { path: '/applications', label: 'Application Tracker', icon: Send },
  { path: '/notifications', label: 'Gmail Daily Digest', icon: Bell },
  { path: '/profile', label: 'Candidate Profile', icon: User },
  { path: '/settings', label: 'Agent Settings', icon: Sliders },
  { path: '/logs', label: 'System Logs', icon: ScrollText }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
          ⚡
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            AI Job Hunter
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-1.5 py-0.5 rounded border border-indigo-500/30">PRO</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Global Fresher Engine</div>
        </div>
      </div>

      {/* Experience Policy Badge */}
      <div className="mx-4 my-3 px-3 py-2 bg-indigo-950/40 border border-indigo-800/40 rounded-lg flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[11px] text-indigo-200">
          Strict Policy: <strong>0–2 Yrs Only</strong>
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        v1.0.0 &bull; Continuous Discovery
      </div>
    </aside>
  );
}

