import React, { useState } from 'react';
import { MoUAgreement } from '../types';
import { api } from '../services/api';
import { FileText, CheckCircle, ShieldCheck, Scale, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  mou: MoUAgreement;
  userRole: string;
  onAcknowledged: () => void;
  onClose: () => void;
}

export const MoUModal: React.FC<Props> = ({ mou, userRole, onAcknowledged, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const canAcknowledge =
    (userRole === 'university' && !mou.university_acknowledged) ||
    (userRole === 'industry' && !mou.industry_acknowledged);

  const handleAcknowledge = async () => {
    if (!agreedTerms) return;
    setLoading(true);
    try {
      const res = await api.post('/collaboration/acknowledge-mou', { mouId: mou.id });
      if (res.data.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        onAcknowledged();
      }
    } catch (e) {
      console.error('Error acknowledging MoU:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Scale size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Built-in IP & MoU Agreement Framework</h3>
              <p className="text-xs text-blue-200">
                PPT Feature 4.4 • Pre-drafted academia-industry IP sharing framework removing friction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-indigo-800">
              Template Type: {mou.template_type}
            </span>
            <h4 className="text-sm font-bold text-gray-900 mt-0.5">{mou.template_title}</h4>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-gray-500 font-semibold block">Academic Institution:</span>
              <p className="font-bold text-blue-950 mt-1">{mou.university_name}</p>
              <div className="mt-2 flex items-center gap-1">
                {mou.university_acknowledged ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle size={12} /> Digitally Signed
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Pending Signature
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-gray-500 font-semibold block">Industry CSR Sponsor:</span>
              <p className="font-bold text-blue-950 mt-1">{mou.industry_name}</p>
              <div className="mt-2 flex items-center gap-1">
                {mou.industry_acknowledged ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle size={12} /> Digitally Signed
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Pending Signature
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Agreement Terms Box */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 block mb-1">
              Standard IP & Implementation Terms:
            </span>
            <p className="text-xs text-gray-600 leading-relaxed font-serif">
              "{mou.terms_summary}"
            </p>
          </div>

          {/* Interactive Checkbox for Digital Acknowledgment */}
          {canAcknowledge && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-200 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-blue-950 leading-snug">
                I represent my organization and hereby digitally acknowledge and agree to the
                IP-sharing covenants and pilot deployment roadmap.
              </span>
            </label>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Cryptographically Verified Agreement</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Close
            </button>
            {canAcknowledge && (
              <button
                disabled={!agreedTerms || loading}
                onClick={handleAcknowledge}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
              >
                {loading ? 'Signing...' : 'Acknowledge MoU Agreement'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
