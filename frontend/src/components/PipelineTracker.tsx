import React, { useState } from 'react';
import { Problem, ProblemStatus } from '../types';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  GitBranch,
  Building,
  FileCheck2,
  DollarSign,
  Rocket,
  AlertCircle
} from 'lucide-react';

const PIPELINE_STEPS: { status: ProblemStatus; label: string; desc: string }[] = [
  { status: 'Submitted', label: '1. Submitted', desc: 'Citizen report captured & geotagged' },
  { status: 'Classified', label: '2. Classified', desc: 'AI classification & severity scored' },
  { status: 'Clustered', label: '3. Clustered', desc: 'pgvector deduplication matched' },
  { status: 'Adopted', label: '4. Adopted', desc: 'University R&D lab assigned' },
  { status: 'Solution Proposed', label: '5. Solution Proposed', desc: 'Technical blueprint & budget submitted' },
  { status: 'Industry Supported', label: '6. Industry Supported', desc: 'CSR funding / Implementation committed' },
  { status: 'Piloted', label: '7. Piloted', desc: 'Field trial & municipal validation' },
  { status: 'Resolved', label: '8. Resolved', desc: 'Permanent civic outcome delivered' }
];

interface Props {
  problem: Problem;
}

export const PipelineTracker: React.FC<Props> = ({ problem }) => {
  const currentIndex = PIPELINE_STEPS.findIndex(s => s.status === problem.status);
  const activeIndex = currentIndex !== -1 ? currentIndex : 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Four-Way Convergence Lifecycle
          </span>
          <h4 className="text-base font-bold text-gray-900 mt-1">
            Tracking Progress for: {problem.title}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 font-medium">Current Active Milestone:</span>
          <p className="text-sm font-black text-blue-900">{problem.status}</p>
        </div>
      </div>

      {/* Progress Bar with Steps */}
      <div className="mt-6 relative">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-center min-w-[700px] justify-between relative">
            {/* Background connecting bar */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0" />
            <div
              className="absolute top-4 left-6 h-1 bg-emerald-500 transition-all duration-500 -z-0"
              style={{ width: `${(activeIndex / (PIPELINE_STEPS.length - 1)) * 95}%` }}
            />

            {PIPELINE_STEPS.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.status} className="flex flex-col items-center text-center z-10 w-24">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                        : isCurrent
                        ? 'bg-blue-900 text-white shadow-md ring-4 ring-blue-100 animate-pulse'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 leading-tight ${
                      isCurrent
                        ? 'text-blue-950 font-extrabold'
                        : isPast
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label.replace(/^\d+\.\s*/, '')}
                  </span>
                  <span className="text-[9px] text-gray-500 hidden sm:block mt-0.5 max-w-[90px]">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
