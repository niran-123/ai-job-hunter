import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  ExternalLink,
  MapPin,
  Briefcase,
  CheckCircle2,
  RefreshCw,
  Globe2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

const DISTRICT_CHIPS = [
  'All Districts',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Trichy',
  'Salem',
  'Tirunelveli',
  'Hosur',
  'Erode',
  'Vellore'
];

const CATEGORY_CHIPS = [
  'All Categories',
  'Homegrown SaaS Giant',
  'Large Indian IT',
  'MNC',
  'Mid-Sized IT',
  'Startup',
  'Regional IT'
];

export default function Companies() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Fetch Tamil Nadu Ecosystem Statistics
  const { data: statsData } = useQuery({
    queryKey: ['tn-stats'],
    queryFn: async () => {
      const res = await api.get('/tamil-nadu/stats');
      return res.data?.data || null;
    }
  });

  // Fetch Monitored Companies Directory
  const { data: directoryData, isLoading, refetch } = useQuery({
    queryKey: ['tn-directory', selectedDistrict, selectedCategory, searchTerm],
    queryFn: async () => {
      const params = {};
      if (selectedDistrict !== 'All Districts') params.city = selectedDistrict;
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/tamil-nadu/directory', { params });
      return res.data?.data || [];
    }
  });

  const companies = directoryData || [];

  const handleTriggerScan = async () => {
    setIsScanning(true);
    setScanMessage('Scanning Tamil Nadu career portals and LinkedIn feeds...');
    try {
      const res = await api.post('/tamil-nadu/scan');
      setScanMessage(res.data?.message || 'Scan completed successfully!');
      setTimeout(() => setScanMessage(''), 4500);
      refetch();
    } catch (err) {
      setScanMessage('Scan initiated in background.');
      setTimeout(() => setScanMessage(''), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900/40 shadow-xl shadow-slate-950/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Tamil Nadu & India IT Company Directory
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Monitored IT Employers Directory
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Continuously tracking <strong>7,525+ registered software & IT companies</strong> across Chennai, Coimbatore, Madurai, Trichy, Salem and all 38 districts of Tamil Nadu alongside live LinkedIn feeds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Feeds...' : 'Trigger Live Portal & LinkedIn Scan'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Ecosystem KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            Total Registered IT Firms
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">7,525</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tamil Nadu Official Directory</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Chennai Tech Engine
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">~1,770</div>
          <div className="text-[11px] text-slate-500 mt-0.5">OMR, Siruseri, Guindy, Tidel</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            Coimbatore Corridor
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">~829</div>
          <div className="text-[11px] text-slate-500 mt-0.5">SaaS, IIoT & Hardware-Software</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-violet-600" />
            Madurai & Southern SEZs
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">~446+</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Vadapalanji & ELCOT SEZ Hubs</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies by name, domain (Cloud, DevOps, AI, SaaS), or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span>Showing: <strong>{companies.length}</strong> monitored employers</span>
          </div>
        </div>

        {/* District Filter Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Filter by Tamil Nadu District / IT Hub:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DISTRICT_CHIPS.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedDistrict === dist
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Filter by Company Category:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_CHIPS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading Monitored Companies Directory...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No companies match your filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the district or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => {
            const isSaaS = (c.category || '').includes('SaaS');
            const isMNC = (c.category || '').includes('MNC');
            const isLargeIT = (c.category || '').includes('Large');
            const isStartup = (c.category || '').includes('Startup');

            let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
            if (isSaaS) badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
            else if (isMNC) badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            else if (isLargeIT) badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
            else if (isStartup) badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

            return (
              <div
                key={c.id || c.name}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Monitoring Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                      {c.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Monitored
                    </span>
                  </div>

                  {/* Company Name */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{c.city}, {c.district || 'Tamil Nadu'}</span>
                      {c.secondaryCities && c.secondaryCities.length > 0 && (
                        <span className="text-[10px] text-slate-400">
                          (+{c.secondaryCities.join(', ')})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="text-xs text-slate-600 line-clamp-2">
                    <strong>Specialization:</strong> {c.specialization || 'Software Development & IT Solutions'}
                  </div>

                  {/* Fresher Policy */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Fresher Intake:</span>{' '}
                    {c.fresherRecruitment}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    {c.careersUrl && (
                      <a
                        href={c.careersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Careers Portal</span>
                      </a>
                    )}

                    {c.linkedInUrl && (
                      <a
                        href={c.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] text-xs font-semibold rounded-xl transition-all"
                      >
                        <Globe2 className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/jobs?search=${encodeURIComponent(c.name)}`)}
                    className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1 transition-all cursor-pointer"
                  >
                    <span>View Jobs from {c.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
