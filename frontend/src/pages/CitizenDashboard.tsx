import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api, saveOfflineSubmission, getOfflineSubmissions, syncOfflineSubmissions } from '../services/api';
import { Problem } from '../types';
import { PipelineTracker } from '../components/PipelineTracker';
import {
  Send,
  MapPin,
  Camera,
  WifiOff,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Submission Form State (Multilingual & Geotagged)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Ranchi');
  const [ward, setWard] = useState('Ward 6');
  const [stateName, setStateName] = useState('Jharkhand');
  const [latitude, setLatitude] = useState(23.3441);
  const [longitude, setLongitude] = useState(85.3096);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [offlineItemsCount, setOfflineItemsCount] = useState(0);

  useEffect(() => {
    fetchMyProblems();
    setOfflineItemsCount(getOfflineSubmissions().length);
  }, []);

  const fetchMyProblems = async () => {
    try {
      const res = await api.get('/problems');
      if (res.data.success) {
        setProblems(res.data.problems);
        if (res.data.problems.length > 0 && !selectedProblem) {
          setSelectedProblem(res.data.problems[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchGps = () => {
    if ('geolocation' in navigator) {
      setIsGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
          setIsGpsLoading(false);
        },
        () => {
          setIsGpsLoading(false);
        },
        { timeout: 5000 }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 preview & data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setPhotoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setPhotoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    const payload = {
      title,
      description,
      district,
      ward,
      state: stateName,
      latitude,
      longitude,
      language,
      photo_url: photoUrl || undefined
    };

    try {
      // Normal submission via API Gateway -> Async Queue
      const res = await api.post('/problems/submit', payload);
      if (res.data.success) {
        confetti({ particleCount: 70, spread: 50 });
        setSubmissionFeedback(
          'Instant Confirmation: Problem captured with photo evidence! AI classification & pgvector routing running in background.'
        );
        setTitle('');
        setDescription('');
        handleRemoveImage();
        fetchMyProblems();
      }
    } catch (err) {
      // Offline fallback: save to IndexedDB/LocalStorage
      saveOfflineSubmission(payload);
      setOfflineItemsCount(getOfflineSubmissions().length);
      setSubmissionFeedback(
        'Offline Mode: Connectivity lost. Form and image saved securely to offline store. Auto-sync will dispatch once online.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncOffline = async () => {
    const synced = await syncOfflineSubmissions();
    setOfflineItemsCount(getOfflineSubmissions().length);
    if (synced > 0) {
      fetchMyProblems();
      alert(`Successfully synced ${synced} offline report(s)!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Offline Sync Alert */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/20">
            Citizen Empowerment Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p className="text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
            Report grassroot societal problems in your ward. AI auto-routes your grievance directly
            to university engineering labs and industry CSR sponsors for rapid solving.
          </p>
        </div>

        {offlineItemsCount > 0 && (
          <div className="bg-amber-500/20 border border-amber-400/40 p-4 rounded-2xl flex items-center gap-3">
            <WifiOff size={20} className="text-amber-300" />
            <div>
              <p className="text-xs font-bold text-white">
                {offlineItemsCount} Offline Report(s) Pending
              </p>
              <button
                onClick={handleSyncOffline}
                className="text-[11px] font-extrabold text-amber-300 underline flex items-center gap-1 mt-0.5"
              >
                <RefreshCw size={11} /> Sync Now to Server
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Multilingual, Geotagged, & Photo Evidence Submission Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t('reportProblem')}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Supports English, हिन्दी, GPS geotagging & photo evidence
              </p>
            </div>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-800">
              <Sparkles size={18} />
            </span>
          </div>

          {submissionFeedback && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-medium text-emerald-900 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{submissionFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {t('problemTitle')}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Contaminated Drinking Water Pipeline in Ward 6"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {t('problemDescription')}
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe symptoms, affected households, water quality, road condition, or school infrastructure needs..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Photo Evidence Upload Box */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center justify-between">
                <span>{t('uploadPhoto')}</span>
                <span className="text-[10px] text-gray-400 font-normal">JPG, PNG (max 5MB)</span>
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 group">
                  <img
                    src={imagePreview}
                    alt="Problem Evidence"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700 transition-colors"
                    title="Remove Photo"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-400" /> Photo Attached
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-4 cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 transition-all">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mb-1.5">
                    <Camera size={20} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    Click to capture or upload photo
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    Helps AI analyze physical damage & visual severity
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  District / जिला
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Ward / Block / वार्ड
                </label>
                <input
                  type="text"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Geotagging Capture Box */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-600" /> Geotagging Coordinates
                </span>
                <button
                  type="button"
                  onClick={handleFetchGps}
                  disabled={isGpsLoading}
                  className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  {isGpsLoading ? 'Fetching GPS...' : 'Auto-Detect GPS'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-600">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  Lat: {latitude}
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  Lng: {longitude}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Grievance'}
            </button>
          </form>
        </div>

        {/* Right Column: Interactive 4-Way Convergence Pipeline Tracker & Reports List */}
        <div className="lg:col-span-7 space-y-6">
          {selectedProblem && (
            <div className="space-y-4">
              <PipelineTracker problem={selectedProblem} />

              {/* Photo Evidence Preview on Selected Report Card */}
              {selectedProblem.photo_url && (
                <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={selectedProblem.photo_url}
                    alt={selectedProblem.title}
                    className="w-full sm:w-48 h-32 rounded-2xl object-cover border border-gray-200 shadow-xs"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase">
                      Citizen Photo Evidence Verified
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">Ground Inspection Image</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Captured at {selectedProblem.ward}, {selectedProblem.district} ({selectedProblem.latitude}, {selectedProblem.longitude}).
                      Processed for visual severity scoring.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Citizen's Reported Problems Feed */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                Recent Civic Reports & Solutions Feed ({problems.length})
              </h3>
              <span className="text-xs text-gray-500">Click any report to track lifecycle</span>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500 py-6 text-center">Loading reports...</p>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {problems.map((p) => {
                  const isSelected = selectedProblem?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProblem(p)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {p.category}
                          </span>
                          <span className="text-xs font-extrabold text-blue-950">{p.status}</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mt-2 truncate">{p.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.description}</p>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                          <span>
                            {p.district} • {p.ward}
                          </span>
                          <span>{p.affected_citizens_count} citizens affected</span>
                        </div>
                      </div>

                      {p.photo_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                          <img
                            src={p.photo_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
