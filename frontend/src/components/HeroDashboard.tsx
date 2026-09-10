import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { Problem } from '../types';

interface Props {
  problems: Problem[];
  onOpenReport: () => void;
  onExplorePortals: () => void;
  onSelectProblem?: (problem: Problem) => void;
  onSelectRole?: (role: import('../types').UserRole) => void;
}

export const HeroDashboard: React.FC<Props> = ({
  problems,
  onOpenReport,
  onExplorePortals,
  onSelectProblem,
  onSelectRole
}) => {
  const { user, switchDemoRole } = useAuth();
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 4 Live Stats Cards matching screenshot
  const stats = [
    {
      label: 'Reported Challenges',
      value: `${problems.length}+`,
      subtext: 'Across 18 Districts'
    },
    {
      label: 'Pilot Universities',
      value: '5',
      subtext: 'BIT Mesra, IIT BHU, COEP...'
    },
    {
      label: 'CSR Funding Engaged',
      value: '₹22.1 Lakhs',
      subtext: 'Tata Steel, Mahindra, Infosys'
    },
    {
      label: 'AI Routing Accuracy',
      value: '100%',
      subtext: 'pgvector Semantic Match'
    }
  ];

  const filteredProblems = problems.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.district.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-10">
      {/* 1. HERO GRADIENT SECTION (Exact match to screenshot) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1E3A8A] via-[#1E40AF] to-[#0F172A] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300 via-indigo-500 to-transparent" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-bold text-blue-100 shadow-sm">
            <Sparkles size={13} className="text-amber-300" />
            <span>National Societal Innovation Platform • Digital India</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-tight sm:leading-none">
            {t('heroHeadline1')}{' '}
            <span className="text-amber-400">{t('heroHeadline2')}</span>
          </h1>

          {/* Subtitle Paragraph */}
          <p className="text-sm sm:text-base text-blue-100/90 max-w-3xl mx-auto leading-relaxed font-normal">
            {t('heroSubtitle')}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onOpenReport}
              className="px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <span>{t('reportProblem')}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onExplorePortals}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <span>{t('explorePortals')}</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 4 Stats Cards Grid (Matching screenshot translucent glass styling) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-10 text-left">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md hover:bg-white/15 transition-all shadow-md"
              >
                <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">
                  {s.label}
                </p>
                <h3
                  className={`text-2xl sm:text-3xl font-black mt-1 ${
                    s.value.includes('₹')
                      ? 'text-amber-300'
                      : s.value.includes('100')
                      ? 'text-emerald-400'
                      : 'text-white'
                  }`}
                >
                  {s.value}
                </h3>
                <p className="text-[10px] text-blue-200/80 mt-1 truncate font-medium">
                  {s.subtext}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STAKEHOLDER PORTAL SELECTOR CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Four-Way Convergence Stakeholder Portals
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select any role to experience their dedicated workflow
            </p>
          </div>
          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Platform Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Citizen Portal Card */}
          <div
            onClick={() => onSelectRole ? onSelectRole('citizen') : switchDemoRole('citizen')}
            className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                1. Citizen Layer
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-1">Report & Track Grievances</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Geotagged submission with photo upload, Hindi/English input, and offline IndexedDB sync.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Login & Enter Portal</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* University Portal Card */}
          <div
            onClick={() => onSelectRole ? onSelectRole('university') : switchDemoRole('university')}
            className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap size={24} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">
                2. Academic Layer
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-1">AI-Routed Challenges</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                "Why This Was Routed Here" Explainability Cards, 1-click adoption, and proposal uploads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Login & Enter Portal</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Industry Portal Card */}
          <div
            onClick={() => onSelectRole ? onSelectRole('industry') : switchDemoRole('industry')}
            className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-lg hover:border-amber-500 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <Briefcase size={24} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
                3. Industry CSR Layer
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-1">Fund & Execute Pilots</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Discover proposals, commit CSR funding, and digitally sign collaborative MoU/IP agreements.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Login & Enter Portal</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Admin Portal Card */}
          <div
            onClick={() => onSelectRole ? onSelectRole('admin') : switchDemoRole('admin')}
            className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-lg hover:border-purple-500 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700">
                4. Government Admin
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-1">District Heatmaps & AI Override</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Warehouse-pattern district density telemetry, participation metrics, and AI override controls.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Login & Enter Portal</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. RECENT GROUND CHALLENGES EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Grassroot Societal Challenges Pipeline ({filteredProblems.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time feed deduplicated via pgvector semantic similarity
              </p>
            </div>

            {/* Filter toolbar */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-gray-50 outline-none"
              >
                <option value="all">All Sectors</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="Healthcare & Nutrition">Healthcare & Nutrition</option>
                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                <option value="Agriculture & Irrigation">Agriculture & Irrigation</option>
                <option value="Clean Energy">Clean Energy</option>
                <option value="Waste & Environment">Waste & Environment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filteredProblems.slice(0, 6).map((prob) => (
              <div
                key={prob.id}
                onClick={() => onSelectProblem?.(prob)}
                className="p-5 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {prob.category}
                    </span>
                    <span className="text-[11px] font-extrabold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {prob.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 mt-3 leading-snug line-clamp-2">
                    {prob.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {prob.description}
                  </p>

                  {prob.photo_url && (
                    <div className="mt-3 rounded-xl overflow-hidden h-28 border border-gray-200">
                      <img
                        src={prob.photo_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-rose-500" />
                    {prob.district}
                  </span>
                  <span>{prob.affected_citizens_count} Citizens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
