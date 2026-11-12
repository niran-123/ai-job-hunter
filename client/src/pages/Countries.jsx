import React, { useState, useEffect } from 'react';
import { Globe, Check, Plus, Search, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCountries = async () => {
    try {
      const res = await api.get('/countries');
      setCountries(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const toggleCountry = async (code, currentStatus) => {
    try {
      await api.put('/countries', { code, isEnabled: !currentStatus });
      setCountries(prev =>
        prev.map(c => (c.code === code ? { ...c, isEnabled: !currentStatus } : c))
      );
    } catch (err) {
      console.error('Failed to toggle country preference', err);
    }
  };

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const enabledCount = countries.filter(c => c.isEnabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Country Explorer & Target Regions</h1>
          <p className="text-sm text-slate-500">
            The automated agent only discovers jobs in user-selected countries. Enable or disable target countries anytime.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 self-start md:self-auto">
          {enabledCount} of {countries.length} Countries Active
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter country name or code..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((country) => (
          <div
            key={country.code}
            className={`bg-white rounded-xl border p-5 transition shadow-xs flex flex-col justify-between ${
              country.isEnabled ? 'border-indigo-300 ring-1 ring-indigo-500/20' : 'border-slate-200 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                  {country.code}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{country.name}</h3>
                  <span className="text-xs text-slate-500">
                    {country.jobCount || 0} Opportunities Available
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleCountry(country.code, country.isEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  country.isEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {country.isEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Source Coverage: Greenhouse, Lever</span>
              {country.isEnabled && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Discovery Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

