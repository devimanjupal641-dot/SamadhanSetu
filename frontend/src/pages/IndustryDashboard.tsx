import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Problem, MoUAgreement, IndustrySupport } from '../types';
import { MoUModal } from '../components/MoUModal';
import {
  Briefcase,
  DollarSign,
  CheckCircle2,
  Scale,
  TrendingUp,
  FileCheck,
  Building,
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IndustryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // Commitment Workflow Modal
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [stage, setStage] = useState<'Interested' | 'Committed' | 'Funded'>('Committed');
  const [fundingAmount, setFundingAmount] = useState('500000');
  const [supportType, setSupportType] = useState<'funding' | 'implementation' | 'csr_grant'>('funding');
  const [notes, setNotes] = useState('Aligned with Corporate CSR Environmental Mandate 2026.');
  const [submitting, setSubmitting] = useState(false);

  // Active MoU Review Modal
  const [activeMoU, setActiveMoU] = useState<MoUAgreement | null>(null);

  useEffect(() => {
    fetchAdoptedProblems();
  }, []);

  const fetchAdoptedProblems = async () => {
    try {
      const res = await api.get('/problems');
      if (res.data.success) {
        // Show challenges that have reached adoption or proposal stage
        setProblems(res.data.problems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCommitment = (prob: Problem) => {
    setSelectedProblem(prob);
  };

  const handleUpdateCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem) return;

    setSubmitting(true);
    try {
      const res = await api.post('/collaboration/industry-support', {
        problemId: selectedProblem.id,
        supportType,
        commitmentStage: stage,
        amountInr: Number(fundingAmount),
        notes
      });

      if (res.data.success) {
        confetti({ particleCount: 100, spread: 70 });
        setSelectedProblem(null);
        fetchAdoptedProblems();
        if (res.data.mou) {
          setActiveMoU(res.data.mou);
        }
      }
    } catch (err) {
      console.error('Industry support failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const inspectMoU = async (problemId: string) => {
    try {
      const res = await api.get(`/problems/${problemId}`);
      if (res.data.mouAgreement) {
        setActiveMoU(res.data.mouAgreement);
      } else {
        alert('MoU will be generated once you select "Interested", "Committed", or "Funded".');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter for challenges adopted or proposal-ready
  const actionableChallenges = problems.filter((p) =>
    ['Adopted', 'Solution Proposed', 'Industry Supported', 'Piloted', 'Resolved'].includes(p.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Industry Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/20">
            Industry CSR & Implementation Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            {user?.organization_name || 'Tata Trusts & CSR Ventures'}
          </h1>
          <p className="text-sm text-emerald-200 mt-1 max-w-2xl leading-relaxed">
            Directly discover vetted societal challenges with existing university engineering proposals.
            Fund pilots, commit implementation support, and digitally execute the <strong>MoU & IP Framework</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/15">
          <Briefcase className="text-emerald-300" size={28} />
          <div>
            <p className="text-xs text-emerald-200">Active CSR Mandate:</p>
            <p className="text-sm font-bold text-white">Clean Water & Public Infrastructure</p>
          </div>
        </div>
      </div>

      {/* Actionable Project Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            University Adopted Civic Challenges Seeking Funding ({actionableChallenges.length})
          </h2>
          <span className="text-xs text-gray-500">
            Lifecycle stages: Interested → Committed → Funded → MoU
          </span>
        </div>

        {loading ? (
          <p className="text-center py-12 text-sm text-gray-500">Loading university solutions...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionableChallenges.map((prob) => {
              const isFunded = prob.status === 'Industry Supported' || prob.status === 'Piloted';

              return (
                <div
                  key={prob.id}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {prob.category}
                      </span>
                      <span className="text-xs font-extrabold text-blue-950 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        Status: {prob.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mt-3 leading-snug">
                      {prob.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {prob.description}
                    </p>

                    <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
                      <span className="text-[10px] uppercase font-bold text-indigo-900 block">
                        Assigned Academic Institution & Department:
                      </span>
                      <p className="font-bold text-blue-950 mt-0.5">
                        {prob.recommended_department}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-1">
                        Impact Scope: <strong>{prob.affected_citizens_count} citizens</strong> in {prob.district}
                      </p>
                    </div>
                  </div>

                  {/* Industry Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => inspectMoU(prob.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 py-1.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200"
                    >
                      <Scale size={14} /> Review MoU Agreement
                    </button>

                    <button
                      onClick={() => handleOpenCommitment(prob)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs ${
                        isFunded
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isFunded ? (
                        <>
                          <CheckCircle2 size={14} /> Funding Allocated
                        </>
                      ) : (
                        <>
                          <HeartHandshake size={14} /> Commit CSR Support <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Industry Commitment & Funding Flow (Interested -> Committed -> Funded) */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
                  <DollarSign size={20} />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    Allocate CSR / Implementation Support
                  </h3>
                  <p className="text-xs text-gray-500">{selectedProblem.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProblem(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateCommitment} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Commitment Stage (Section 4.3 Pipeline)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Interested', 'Committed', 'Funded'] as const).map((stg) => (
                    <button
                      type="button"
                      key={stg}
                      onClick={() => setStage(stg)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        stage === stg
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Support Type
                </label>
                <select
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 outline-none font-medium"
                >
                  <option value="funding">Direct CSR Grant Funding</option>
                  <option value="implementation">Municipal Hardware & Distribution</option>
                  <option value="csr_grant">Multi-year Endowment Grant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Commitment Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Corporate Partnership Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProblem(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                >
                  {submitting ? 'Updating...' : `Confirm "${stage}" Status`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MoU Modal */}
      {activeMoU && (
        <MoUModal
          mou={activeMoU}
          userRole="industry"
          onClose={() => setActiveMoU(null)}
          onAcknowledged={() => {
            setActiveMoU(null);
            fetchAdoptedProblems();
          }}
        />
      )}
    </div>
  );
};
