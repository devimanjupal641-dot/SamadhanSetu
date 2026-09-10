import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroDashboard } from './components/HeroDashboard';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { UniversityDashboard } from './pages/UniversityDashboard';
import { IndustryDashboard } from './pages/IndustryDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { UserRole, Problem } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const { user, isFirstVisit, dismissFirstVisit } = useAuth();
  const [currentView, setCurrentView] = useState<'hero' | 'portal' | 'login'>('hero');
  const [targetLoginRole, setTargetLoginRole] = useState<UserRole>('citizen');
  const [problems, setProblems] = useState<Problem[]>([]);

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
    }
  };

  const handleOpenLogin = (role?: UserRole) => {
    setTargetLoginRole(role || user?.role || 'citizen');
    setCurrentView('login');
  };

  const handleNavigateHome = () => {
    setCurrentView('hero');
  };

  const handleOpenReport = () => {
    setCurrentView('portal');
  };

  const renderActiveDashboard = () => {
    if (currentView === 'login') {
      return (
        <LoginPage
          initialRole={targetLoginRole}
          onBackToPortal={() => setCurrentView('hero')}
          onSuccess={() => setCurrentView('portal')}
        />
      );
    }

    if (currentView === 'hero') {
      return (
        <HeroDashboard
          problems={problems}
          onOpenReport={() => handleOpenLogin('citizen')}
          onExplorePortals={() => handleOpenLogin('university')}
          onSelectRole={(role) => handleOpenLogin(role)}
        />
      );
    }

    // Role-based portal rendering
    switch (user?.role) {
      case 'citizen':
        return <CitizenDashboard />;
      case 'university':
        return <UniversityDashboard />;
      case 'industry':
        return <IndustryDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <CitizenDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-gray-900">
      {/* Screenshot-Matched Navbar */}
      <Navbar
        onOpenLogin={handleOpenLogin}
        onNavigateHome={handleNavigateHome}
        onOpenReport={handleOpenReport}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {renderActiveDashboard()}
      </main>

      {/* Platform Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-blue-950">SamadhanSetu (समाधानसेतु)</span>
            <span>• National Societal Innovation Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
