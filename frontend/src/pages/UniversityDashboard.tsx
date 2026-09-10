import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Problem, UniversityAdoption, MoUAgreement } from '../types';
import { ExplainabilityCard } from '../components/ExplainabilityCard';
import { MoUModal } from '../components/MoUModal';
import {
  GraduationCap,
  Filter,
  CheckCircle,
  FileUp,
  Scale,
  Sparkles,
  Search,
  Building2,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UniversityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  // Proposal modal state
  const [adoptingProblem, setAdoptingProblem] = useState<Problem | null>(null);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [budgetEstimate, setBudgetEstimate] = useState('450000');
  const [timeline, setTimeline] = useState('4 Months Pilot Trial');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // MoU modal state
  const [activeMoU, setActiveMoU] = useState<MoUAgreement | null>(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/problems');
      if (res.data.success) {
        setProblems(res.data.problems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptClick = (prob: Problem) => {
    setAdoptingProblem(prob);
    setProposalTitle(`Advanced Rapid Prototyping for ${prob.title}`);
    setProposalText(
      `Our engineering department proposes deploying a decentralized sensor and physical treatment prototype targeting ${prob.category} indicators across ${prob.district}.`
    );
  };

  const handleConfirmAdoptionAndProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptingProblem) return;

    setSubmittingProposal(true);
    try {
      // Step 1: Adopt challenge
      await api.post('/collaboration/adopt', {
        problemId: adoptingProblem.id,
        department: user?.department || 'Civil & Environmental Engineering'
      });

      // Step 2: Upload Solution Proposal
      await api.post('/collaboration/proposal', {
        problemId: adoptingProblem.id,
        proposalTitle,
        proposalText,
        budgetEstimate: Number(budgetEstimate),
        estimatedTimeline: timeline
      });

      confetti({ particleCount: 90, spread: 60 });
      setAdoptingProblem(null);
      fetchProblems();
    } catch (err) {
      console.error('Adoption failed:', err);
    } finally {
      setSubmittingProposal(false);
    }
  };

  const openMoUReview = async (problemId: string) => {
    try {
      const res = await api.get(`/problems/${problemId}`);
      if (res.data.mouAgreement) {
        setActiveMoU(res.data.mouAgreement);
      } else {
        alert('MoU Agreement will be initiated once an Industry CSR partner commits to funding this challenge.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProblems = problems.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* University Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/20">
            University Research & Innovation Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            {user?.organization_name || 'BIT Mesra Ranchi'}
          </h1>
          <p className="text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
            AI Auto-Routes verified societal problems directly to your engineering departments.
            Inspect the <strong>Explainability Card</strong>, adopt challenges, and submit project proposals
            to unlock Industry CSR funding.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/15">
          <GraduationCap className="text-indigo-300" size={28} />
          <div>
            <p className="text-xs text-blue-200">Assigned Department:</p>
            <p className="text-sm font-bold text-white">{user?.department || 'Water & Environmental Engineering'}</p>
          </div>
        </div>
      </div>

      {/* Filter & Category Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-700">Filter by Sector:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-800 outline-none"
          >
            <option value="all">All Sectors ({problems.length})</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Healthcare & Nutrition">Healthcare & Nutrition</option>
            <option value="Roads & Infrastructure">Roads & Infrastructure</option>
            <option value="Agriculture & Irrigation">Agriculture & Irrigation</option>
            <option value="Clean Energy">Clean Energy</option>
            <option value="Waste & Environment">Waste & Environment</option>
            <option value="Education & Skill Development">Education & Skill Development</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <strong>{filteredProblems.length}</strong> AI-classified societal challenges
        </div>
      </div>

      {/* Explainability Cards Grid (Section 4.2 of prompt) */}
      {loading ? (
        <p className="text-center py-12 text-sm text-gray-500">Loading AI routing cards...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((prob) => {
            const isAdopted = ['Adopted', 'Solution Proposed', 'Industry Supported', 'Piloted', 'Resolved'].includes(prob.status);

            return (
              <div key={prob.id} className="flex flex-col">
                <ExplainabilityCard
                  problem={prob}
                  isAdopted={isAdopted}
                  onAdopt={() => handleAdoptClick(prob)}
                />
                {isAdopted && (
                  <button
                    onClick={() => openMoUReview(prob.id)}
                    className="mt-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-2 rounded-xl border border-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Scale size={13} /> Inspect / Sign MoU Agreement
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Adopt Challenge & Submit Solution Proposal */}
      {adoptingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-900">
                  <FileUp size={20} />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Adopt & Propose Solution</h3>
                  <p className="text-xs text-gray-500">{adoptingProblem.title}</p>
                </div>
              </div>
              <button
                onClick={() => setAdoptingProblem(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmAdoptionAndProposal} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Proposal Title
                </label>
                <input
                  type="text"
                  required
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Technical Architecture & Solution Blueprint
                </label>
                <textarea
                  rows={4}
                  required
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Estimated Budget (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={budgetEstimate}
                    onChange={(e) => setBudgetEstimate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Target Timeline
                  </label>
                  <input
                    type="text"
                    required
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdoptingProblem(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                >
                  {submittingProposal ? 'Publishing Proposal...' : 'Confirm Adoption & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MoU Modal Review */}
      {activeMoU && (
        <MoUModal
          mou={activeMoU}
          userRole="university"
          onClose={() => setActiveMoU(null)}
          onAcknowledged={() => {
            setActiveMoU(null);
            fetchProblems();
          }}
        />
      )}
    </div>
  );
};
