import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Problem, ProblemCategory } from '../types';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Building,
  ShieldCheck,
  AlertOctagon,
  RefreshCw,
  Cpu,
  Layers,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnalyticsData {
  totalProblems: number;
  totalCitizensAffected: number;
  totalClusters: number;
  totalAdoptions: number;
  totalCommittedFundingINR: number;
  districtBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  universityParticipation: Record<string, number>;
  industryParticipation: Record<string, { count: number; totalInr: number }>;
  notificationMetrics: {
    total: number;
    inAppDelivered: number;
    smsDispatched: number;
    whatsappSimulated: number;
  };
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // Override AI Classification state
  const [overrideProblem, setOverrideProblem] = useState<Problem | null>(null);
  const [newCategory, setNewCategory] = useState<ProblemCategory>('Water & Sanitation');
  const [overrideReason, setOverrideReason] = useState('Municipal domain re-assessment by State Nodal Officer');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [anaRes, probRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/problems')
      ]);
      if (anaRes.data.success) setAnalytics(anaRes.data.analytics);
      if (probRes.data.success) setProblems(probRes.data.problems);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOverride = (prob: Problem) => {
    setOverrideProblem(prob);
    setNewCategory(prob.category);
  };

  const handleConfirmOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideProblem) return;

    setSubmittingOverride(true);
    try {
      const res = await api.post('/admin/override-classification', {
        problemId: overrideProblem.id,
        newCategory,
        overrideReason
      });
      if (res.data.success) {
        confetti({ particleCount: 70, spread: 50 });
        setOverrideProblem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to override classification:', err);
    } finally {
      setSubmittingOverride(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/20">
            Government Administrative Intelligence Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            State Civic Analytics & Governance Bureau
          </h1>
          <p className="text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
            Real-time multi-district societal challenge telemetry (Warehouse-pattern aggregated views).
            Oversee university adoptions, track industry CSR grants, and exercise <strong>AI classification overrides</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/15">
          <ShieldCheck className="text-emerald-400" size={28} />
          <div>
            <p className="text-xs text-blue-200">Logged Official:</p>
            <p className="text-sm font-bold text-white">{user?.name || 'Suresh Chandra IAS'}</p>
          </div>
        </div>
      </div>

      {/* Top Aggregated KPI Cards (Warehouse Analytics Pattern) */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase block">
              Total Reported
            </span>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {analytics.totalProblems}
            </p>
            <span className="text-[10px] text-blue-700 font-semibold mt-1 inline-block">
              54 Ground Grievances
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase block">
              Citizens Impacted
            </span>
            <p className="text-2xl font-black text-blue-950 mt-1">
              {(analytics.totalCitizensAffected || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
              Verified Beneficiaries
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase block">
              Vector Clusters
            </span>
            <p className="text-2xl font-black text-purple-900 mt-1">
              {analytics.totalClusters}
            </p>
            <span className="text-[10px] text-purple-700 font-semibold mt-1 inline-block">
              pgvector Deduplicated
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase block">
              University Adoptions
            </span>
            <p className="text-2xl font-black text-indigo-900 mt-1">
              {analytics.totalAdoptions}
            </p>
            <span className="text-[10px] text-indigo-700 font-semibold mt-1 inline-block">
              Active Lab Prototypes
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs col-span-2 lg:col-span-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase block">
              CSR Funding Allocated
            </span>
            <p className="text-2xl font-black text-emerald-800 mt-1">
              ₹{((analytics.totalCommittedFundingINR || 0) / 100000).toFixed(1)}L
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
              Industry Sanctioned
            </span>
          </div>
        </div>
      )}

      {/* Analytics Visual Breakdowns (District & Sector Heatmaps) */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* District Breakdown */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-4">
              <MapPin size={16} className="text-rose-600" /> District-wise Societal Problem Density
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.districtBreakdown)
                .slice(0, 7)
                .map(([dist, count]) => {
                  const percent = Math.round((count / analytics.totalProblems) * 100);
                  return (
                    <div key={dist} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-800">{dist}</span>
                        <span className="text-gray-500">
                          {count} challenges ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-700 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Sector Category Breakdown */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-4">
              <Layers size={16} className="text-indigo-600" /> Sectoral Distribution (AI Categorization)
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.categoryBreakdown)
                .slice(0, 7)
                .map(([cat, count]) => {
                  const percent = Math.round((count / analytics.totalProblems) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-800">{cat}</span>
                        <span className="text-gray-500">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* AI Classification Override Panel (Prompt Requirement 6.4) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Cpu size={18} className="text-indigo-600" />
              Administrative AI Classification Override Panel
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Government admins can manually re-assign problem categories or reroute departments when needed.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Title & Location</th>
                <th className="py-2.5 px-3">AI Category</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Routed Department</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {problems.slice(0, 10).map((prob) => (
                <tr key={prob.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-3 max-w-[280px]">
                    <p className="font-bold text-gray-900 truncate">{prob.title}</p>
                    <span className="text-[11px] text-gray-500">
                      {prob.district}, {prob.ward}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                      {prob.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-700">
                    {(prob.ai_confidence * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-medium">
                    {prob.recommended_department}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-gray-800">{prob.status}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleOpenOverride(prob)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
                    >
                      <Edit3 size={11} /> Override
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Modal */}
      {overrideProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900">
              Override AI Classification
            </h3>
            <p className="text-xs text-gray-500 mt-1">{overrideProblem.title}</p>

            <form onSubmit={handleConfirmOverride} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  New Category Reassignment
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ProblemCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-medium outline-none"
                >
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Healthcare & Nutrition">Healthcare & Nutrition</option>
                  <option value="Education & Skill Development">Education & Skill Development</option>
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Agriculture & Irrigation">Agriculture & Irrigation</option>
                  <option value="Waste & Environment">Waste & Environment</option>
                  <option value="Clean Energy">Clean Energy</option>
                  <option value="Disaster & Safety">Disaster & Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Official Administrative Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideProblem(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-sm"
                >
                  {submittingOverride ? 'Updating...' : 'Confirm Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
