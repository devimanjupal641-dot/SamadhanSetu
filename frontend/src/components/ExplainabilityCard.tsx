import React from 'react';
import { Problem } from '../types';
import {
  Flame,
  Users,
  MapPin,
  GitMerge,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface Props {
  problem: Problem;
  onAdopt?: () => void;
  isAdopted?: boolean;
}

export const ExplainabilityCard: React.FC<Props> = ({ problem, onAdopt, isAdopted }) => {
  const isHighPriority = problem.severity_score >= 60 || problem.affected_citizens_count > 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      {/* Top Banner with Priority & Category */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                isHighPriority
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <Flame size={13} className={isHighPriority ? 'text-rose-600 animate-pulse' : 'text-amber-600'} />
              Priority: {isHighPriority ? 'HIGH' : 'MEDIUM'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-100">
              {problem.category}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            Score: {problem.severity_score}/100
          </span>
        </div>

        {/* Title & Location */}
        <h3 className="text-base font-bold text-gray-900 leading-snug hover:text-blue-900 transition-colors">
          {problem.title}
        </h3>
        <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
          {problem.description}
        </p>

        {/* Optional Photo Evidence Thumbnail */}
        {problem.photo_url && (
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 h-32 w-full">
            <img
              src={problem.photo_url}
              alt="Citizen Ground Evidence"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Quick Civic Metrics (47 citizens affected • 8 locations • 12 similar reports) */}
        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-[10px] uppercase font-bold">
              <Users size={12} className="text-blue-600" /> Affected
            </div>
            <p className="text-sm font-black text-gray-900 mt-0.5">
              {problem.affected_citizens_count} Citizens
            </p>
          </div>

          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-[10px] uppercase font-bold">
              <MapPin size={12} className="text-rose-500" /> Ward / Block
            </div>
            <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">
              {problem.ward}, {problem.district}
            </p>
          </div>

          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-[10px] uppercase font-bold">
              <GitMerge size={12} className="text-purple-600" /> Vector Cluster
            </div>
            <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">
              {problem.cluster_id ? 'pgvector Matched' : 'Unique Vector'}
            </p>
          </div>
        </div>
      </div>

      {/* CORE PPT PROMISE: "Why This Was Routed Here" Explainability Callout */}
      <div className="mx-5 my-2 p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-purple-50/50 border border-indigo-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-extrabold text-indigo-950 flex items-center gap-1">
            <GraduationCap size={15} className="text-indigo-700" />
            Recommended Department:
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
            {(problem.ai_confidence * 100).toFixed(0)}% Match
          </span>
        </div>
        <p className="text-xs font-bold text-blue-900 mb-2">
          {problem.recommended_department}
        </p>

        {/* Explainability Rationale */}
        <div className="flex items-start gap-1.5 text-[11px] text-gray-700 bg-white/80 p-2 rounded-lg border border-indigo-100">
          <Sparkles size={14} className="text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="text-gray-900 font-semibold">Why? </strong>
            {problem.routing_rationale}
          </p>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-t border-gray-200/70 flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-600 uppercase">
          Status: <span className="text-blue-900 font-extrabold">{problem.status}</span>
        </span>

        {isAdopted ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={14} /> Adopted
          </span>
        ) : onAdopt ? (
          <button
            onClick={onAdopt}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all transform active:scale-95"
          >
            Adopt Challenge <ArrowRight size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
};
