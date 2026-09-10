import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../contexts/AuthContext';
import { UserRole } from '../types';
import {
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  UserPlus,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
  onBackToPortal?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<Props> = ({
  initialRole = 'citizen',
  initialMode = 'login',
  onBackToPortal,
  onSuccess
}) => {
  const { login, registerUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(DEMO_CREDENTIALS[initialRole].email);
  const [password, setPassword] = useState('password123');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [district, setDistrict] = useState('Ranchi');
  const [stateName, setStateName] = useState('Jharkhand');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ROLE_CONFIGS: Record<
    UserRole,
    {
      title: string;
      subtitle: string;
      icon: any;
      bannerGradient: string;
      accentBg: string;
      badgeText: string;
      highlights: string[];
      orgLabel: string;
      orgPlaceholder: string;
    }
  > = {
    citizen: {
      title: 'Citizen Innovation & Grievance Portal',
      subtitle: 'Report local societal issues, upload ground photos & track AI convergence solutions.',
      icon: Users,
      bannerGradient: 'from-blue-900 to-indigo-900',
      accentBg: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeText: 'Citizen Access',
      highlights: [
        'Multilingual form (English + हिन्दी)',
        'GPS geotagging & photo evidence capture',
        'Offline submission sync via IndexedDB',
        '8-stage real-time solution pipeline tracking'
      ],
      orgLabel: 'Ward / Community Forum (Optional)',
      orgPlaceholder: 'e.g., Ward 6 Resident Welfare Association'
    },
    university: {
      title: 'University Research & R&D Hub',
      subtitle: 'Explore AI-routed societal challenges with transparent Explainability Cards.',
      icon: GraduationCap,
      bannerGradient: 'from-indigo-950 to-blue-900',
      accentBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      badgeText: 'Academic Institution Access',
      highlights: [
        '"Why This Was Routed Here" Explainability Cards',
        'Automated department matching & priority rating',
        '1-click challenge adoption and proposal upload',
        'Pre-drafted MoU & IP-sharing framework'
      ],
      orgLabel: 'University / Institute Name',
      orgPlaceholder: 'e.g., BIT Mesra / IIT Bombay'
    },
    industry: {
      title: 'Industry CSR & Grant Partnership Hub',
      subtitle: 'Discover vetted academic proposals and allocate targeted CSR implementation funding.',
      icon: Briefcase,
      bannerGradient: 'from-emerald-950 to-teal-900',
      accentBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeText: 'Industry CSR Access',
      highlights: [
        'Vetted university proposals seeking funding',
        'Lifecycle commitment: Interested → Committed → Funded',
        'Built-in collaborative IP & MoU agreement signing',
        'Impact metrics: citizens benefitted per Rupee'
      ],
      orgLabel: 'Company / CSR Foundation Name',
      orgPlaceholder: 'e.g., Tata Trusts / L&T Sustainability Cell'
    },
    admin: {
      title: 'Government Administrative Intelligence',
      subtitle: 'District-wise density telemetry, institutional analytics, and AI override controls.',
      icon: ShieldCheck,
      bannerGradient: 'from-slate-900 to-blue-950',
      accentBg: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeText: 'State Nodal Officer Access',
      highlights: [
        'Warehouse-pattern aggregated municipal analytics',
        'District & sector problem density heatmaps',
        'AI classification override & department reassignment',
        'Multi-channel notification delivery monitoring'
      ],
      orgLabel: 'Ministry / Nodal Department',
      orgPlaceholder: 'e.g., Ministry of Jal Shakti / Urban Development'
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (mode === 'login') {
      setEmail(DEMO_CREDENTIALS[role].email);
    } else {
      setEmail('');
    }
    setError(null);
  };

  const handleToggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    if (newMode === 'login') {
      setEmail(DEMO_CREDENTIALS[selectedRole].email);
    } else {
      setEmail('');
      setName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'login') {
      const success = await login(email, selectedRole);
      if (!success) {
        setError('Invalid credentials. You can use the pre-filled demo login below.');
      } else {
        if (onSuccess) onSuccess();
      }
    } else {
      if (!name || !email) {
        setError('Full name and email are mandatory.');
        setLoading(false);
        return;
      }

      const res = await registerUser({
        name,
        email,
        password,
        role: selectedRole,
        organization_name: organization,
        department,
        district,
        state: stateName
      });

      if (res.success) {
        confetti({ particleCount: 90, spread: 60 });
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to create account.');
      }
    }
    setLoading(false);
  };

  const currentConfig = ROLE_CONFIGS[selectedRole];

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Informational Showcase Column */}
        <div
          className={`md:col-span-5 bg-gradient-to-br ${currentConfig.bannerGradient} p-8 text-white flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md border border-white/30 flex items-center justify-center bg-white shrink-0">
                <img
                  src="/logo.jpg"
                  alt="SamadhanSetu"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="font-extrabold text-base tracking-wide">
                <span className="text-amber-400">Samadhan</span>
                <span className="text-white">Setu</span>
              </span>
            </div>

            <div className="mt-8">
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                {currentConfig.badgeText}
              </span>
              <h2 className="text-xl font-black mt-3 leading-snug">{currentConfig.title}</h2>
              <p className="text-xs text-blue-100/90 mt-2 leading-relaxed">
                {currentConfig.subtitle}
              </p>
            </div>

            {/* Role Capabilities List */}
            <div className="mt-6 space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                Platform Capabilities:
              </span>
              {currentConfig.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-blue-50">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/15 text-[11px] text-blue-200">
            National Societal Innovation Platform
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Mode Switcher: Sign In vs Create Account */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleToggleMode('register')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-white text-blue-950 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <UserPlus size={13} />
                  <span>Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMode('login')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-white text-blue-950 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
              </div>

              {onBackToPortal && (
                <button
                  onClick={onBackToPortal}
                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft size={13} /> Back to Hub
                </button>
              )}
            </div>

            {/* 4 Dedicated Stakeholder Selector Buttons */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-2">
                Select Your Role:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {(
                  [
                    { role: 'citizen', label: 'Citizen' },
                    { role: 'university', label: 'University' },
                    { role: 'industry', label: 'Industry' },
                    { role: 'admin', label: 'Admin' }
                  ] as const
                ).map((tab) => {
                  const isSelected = selectedRole === tab.role;
                  return (
                    <button
                      key={tab.role}
                      type="button"
                      onClick={() => handleRoleChange(tab.role)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                        isSelected
                          ? 'border-blue-900 bg-blue-900 text-white shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Extra registration fields if Create Account mode */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Full Name / पूरा नाम
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar / Dr. Shalini Deshmukh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <User size={15} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Address / ईमेल
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@organization.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Password / पासवर्ड
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Organization & Location fields for registration */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {currentConfig.orgLabel}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={currentConfig.orgPlaceholder}
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                      <Building size={15} className="absolute left-3 top-3 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                        District / जिला
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                        State / राज्य
                      </label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {mode === 'login' && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-600 block">Pre-configured Demo Account:</span>
                    <p className="font-bold text-blue-950 mt-0.5">{DEMO_CREDENTIALS[selectedRole].label}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Verified Profile
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'register'
                  ? `Create ${selectedRole.toUpperCase()} Account`
                  : `Sign In to ${selectedRole.toUpperCase()} Dashboard`}
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-gray-600">
                Visiting for the first time?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('register')}
                  className="font-bold text-blue-800 hover:underline"
                >
                  Create an Account
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('login')}
                  className="font-bold text-blue-800 hover:underline"
                >
                  Sign In with Demo Credentials
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
