import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserRole } from '../types';
import {
  Globe,
  Bell,
  Smartphone,
  Check,
  ChevronDown,
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { NotificationSimulatorModal } from './NotificationSimulatorModal';

interface Props {
  onOpenLogin?: (role?: UserRole) => void;
  onNavigateHome?: () => void;
  onOpenReport?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenLogin, onNavigateHome, onOpenReport }) => {
  const { user, switchDemoRole, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showSimulator, setShowSimulator] = useState(false);

  // Role details mapping matching the reference screenshot
  const roleDisplayNames: Record<UserRole, string> = {
    admin: 'Dr. Manjunath Bhajantri (IAS)',
    citizen: 'Ramesh Kumar Murmu',
    university: 'Prof. Anirudh Sen (BIT Mesra)',
    industry: 'Vikramaditya Singhania (Tata Trusts)'
  };

  const currentRole = user?.role || 'admin';
  const currentOfficialName = user?.name || roleDisplayNames[currentRole];

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* 1. TOP BLACK ROLE SWITCHER BAR (Exact match to screenshot) */}
      <div className="bg-[#111827] text-white text-[11px] py-1 px-4 sm:px-6 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-300">
            <span className="font-bold text-white">QUICK ROLE SWITCHER:</span> Active:{' '}
            <span className="text-amber-300 capitalize font-bold">{currentRole}</span> ({currentOfficialName})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-[10px] hidden sm:inline mr-1">Switch 1-Click:</span>

          {/* 1. Citizen Button */}
          <button
            onClick={() => onOpenLogin ? onOpenLogin('citizen') : switchDemoRole('citizen')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
              currentRole === 'citizen'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>👤 1. Citizen</span>
            {currentRole === 'citizen' && <span className="text-[9px] bg-black/30 px-1 rounded">✓ LIVE</span>}
          </button>

          {/* 2. University Button */}
          <button
            onClick={() => onOpenLogin ? onOpenLogin('university') : switchDemoRole('university')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
              currentRole === 'university'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>🎓 2. University</span>
            {currentRole === 'university' && <span className="text-[9px] bg-black/30 px-1 rounded">✓ LIVE</span>}
          </button>

          {/* 3. Industry Button */}
          <button
            onClick={() => onOpenLogin ? onOpenLogin('industry') : switchDemoRole('industry')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
              currentRole === 'industry'
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>🏛️ 3. Industry</span>
            {currentRole === 'industry' && <span className="text-[9px] bg-black/30 px-1 rounded">✓ LIVE</span>}
          </button>

          {/* 4. Admin Button */}
          <button
            onClick={() => onOpenLogin ? onOpenLogin('admin') : switchDemoRole('admin')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
              currentRole === 'admin'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>🛡️ 4. Admin</span>
            <span className="text-[9px] text-emerald-600 font-extrabold ml-0.5">✓ LIVE</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WHITE NAVIGATION BAR (Exact match to screenshot) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand: Navy Blue Emblem + English / Multilingual Brand Name */}
            <div
              onClick={onNavigateHome}
              className="flex items-center space-x-3 cursor-pointer select-none"
            >
              <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md border border-amber-300/30 flex items-center justify-center bg-white shrink-0 hover:scale-105 transition-transform">
                <img
                  src="/logo.jpg"
                  alt="SamadhanSetu Logo"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight leading-none">
                  {language === 'en' ? (
                    <>
                      <span className="text-[#C2410C]">Samadhan</span>
                      <span className="text-[#1E3A8A]">Setu</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#C2410C]">समाधान</span>
                      <span className="text-[#1E3A8A]">सेतु</span>
                    </>
                  )}
                </h1>
                <p className="text-[11px] text-gray-500 font-medium mt-1">
                  {language === 'en' ? 'Government of India | National Innovation Initiative' : t('govSubtitle')}
                </p>
              </div>
            </div>

            {/* Right Action Controls: Language, Notification, User Profile Badge */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Language Dropdown Selector with Globe (Hindi, English, Jharkhand Local Languages) */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="appearance-none cursor-pointer flex items-center gap-1.5 text-xs font-semibold pl-8 pr-7 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-xs transition-colors outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="en">English (Official)</option>
                  <option value="sat">संथाली (Santali - संताल परगना)</option>
                  <option value="ho">हो (Ho - कोल्हान / सिंहभूम)</option>
                  <option value="khr">खोरठा / सादरी (छोटानागपुर)</option>
                </select>
                <Globe size={14} className="text-blue-700 absolute left-2.5 top-2.5 pointer-events-none" />
                <ChevronDown size={12} className="text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* SMS / WhatsApp Sim Button */}
              <button
                onClick={() => setShowSimulator(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-xs transition-colors"
                title="SMS / WhatsApp Simulator Logs"
              >
                <Smartphone size={14} className="text-emerald-600" />
                <span className="hidden sm:inline">SMS / WhatsApp Sim</span>
              </button>

              {/* Bell Icon */}
              <button
                onClick={() => setShowSimulator(true)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors relative"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>

              {/* Official Identity & Role Tag */}
              <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-gray-900 leading-none">
                    {currentOfficialName}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                  {currentRole.toUpperCase()}
                </span>

                {/* Logout / Switch Account action */}
                <button
                  onClick={() => onOpenLogin?.(currentRole)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Switch / Sign In with another account"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      {showSimulator && (
        <NotificationSimulatorModal onClose={() => setShowSimulator(false)} />
      )}
    </header>
  );
};
