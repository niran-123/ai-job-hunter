import React, { useState, useEffect } from 'react';
import { User, Plus, Trash2, Save, Sparkles, Check } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    degree: '',
    department: '',
    college: '',
    graduationYear: 2025,
    cgpaOrPercentage: '',
    skills: [],
    certifications: [],
    internships: [],
    projects: [],
    preferredCountries: [],
    preferredJobCategories: [],
    preferredEmploymentTypes: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data?.data) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving profile and recalculating match scores...');
    try {
      await api.put('/profile', profile);
      setSaveStatus('Profile updated! AI match scores refreshed across all jobs.');
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (err) {
      setSaveStatus('Error saving profile');
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const skillObj = { name: newSkill.trim(), category: 'language', proficiency: 'intermediate', yearsOfExperience: 1 };
    setProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skillObj]
    }));
    setNewSkill('');
  };

  const removeSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Profile & Matching Baseline</h1>
          <p className="text-sm text-slate-500">
            This profile is the single source of truth for all AI relevance scoring, strengths analysis, and gap explanations.
          </p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          {saveStatus}
        </div>
      )}

      {/* Personal & Academic Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">1. Academic & Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={profile.fullName || ''}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Degree / Major</label>
            <input
              type="text"
              value={profile.degree || ''}
              onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
              placeholder="e.g. B.Tech Computer Science"
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">College / University</label>
            <input
              type="text"
              value={profile.college || ''}
              onChange={(e) => setProfile({ ...profile, college: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Graduation Year</label>
            <input
              type="number"
              value={profile.graduationYear || 2025}
              onChange={(e) => setProfile({ ...profile, graduationYear: parseInt(e.target.value, 10) })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">CGPA / Percentage</label>
            <input
              type="text"
              value={profile.cgpaOrPercentage || ''}
              onChange={(e) => setProfile({ ...profile, cgpaOrPercentage: e.target.value })}
              placeholder="e.g. 8.5 / 10"
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Technical Skills Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">2. Technical Skills & Tools</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Add a programming language, framework, database, or tool (e.g. TypeScript, React)..."
            className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {(profile.skills || []).map((skill, index) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            return (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold"
              >
                {skillName}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Projects and Internships Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">3. Project & Internship Experience</h2>
        <div className="space-y-3">
          {(profile.projects || []).map((p, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{p.title}</div>
              <div className="text-slate-500">{p.description}</div>
              <div className="text-indigo-600 font-medium">Technologies: {(p.technologies || []).join(', ')}</div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

