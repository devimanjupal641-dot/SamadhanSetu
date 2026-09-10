import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  organization_name?: string;
  department?: string;
  district?: string;
  state?: string;
  language_pref?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  registerUser: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  isAuthenticated: boolean;
  isFirstVisit: boolean;
  dismissFirstVisit: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick Demo Login Mapping for Hackathon Q&A Demonstrations
export const DEMO_CREDENTIALS: Record<UserRole, { email: string; label: string; org: string }> = {
  citizen: {
    email: 'citizen@samadhansetu.gov.in',
    label: 'Ramesh Kumar Murmu (Citizen)',
    org: 'Ward 6 Resident Forum, Ranchi'
  },
  university: {
    email: 'bitmesra@samadhansetu.gov.in',
    label: 'Prof. Anirudh Sen (University Researcher)',
    org: 'BIT Mesra Ranchi — Water & Environment Lab'
  },
  industry: {
    email: 'industry@samadhansetu.gov.in',
    label: 'Vikramaditya Singhania (Industry CSR Lead)',
    org: 'Tata Trusts & Sustainability Initiatives'
  },
  admin: {
    email: 'admin@samadhansetu.gov.in',
    label: 'Suresh Chandra IAS (Government Admin)',
    org: 'Ministry of Jal Shakti / NITI Aayog Cell'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('samadhansetu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('samadhansetu_token');
  });

  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    const hasVisited = localStorage.getItem('samadhansetu_visited');
    return !hasVisited;
  });

  useEffect(() => {
    // If not first visit and no user, default to demo citizen
    if (!user && !token && !isFirstVisit) {
      switchDemoRole('citizen');
    }
  }, [isFirstVisit]);

  const dismissFirstVisit = () => {
    localStorage.setItem('samadhansetu_visited', 'true');
    setIsFirstVisit(false);
    if (!user) {
      switchDemoRole('citizen');
    }
  };

  const login = async (email: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password: 'password123' });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('samadhansetu_token', res.data.token);
        localStorage.setItem('samadhansetu_user', JSON.stringify(res.data.user));
        localStorage.setItem('samadhansetu_visited', 'true');
        setIsFirstVisit(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const registerUser = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password || 'password123',
        role: data.role,
        organization_name: data.organization_name || '',
        department: data.department || '',
        district: data.district || 'Ranchi',
        state: data.state || 'Jharkhand',
        language_pref: data.language_pref || 'en'
      });

      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('samadhansetu_token', res.data.token);
        localStorage.setItem('samadhansetu_user', JSON.stringify(res.data.user));
        localStorage.setItem('samadhansetu_visited', 'true');
        setIsFirstVisit(false);
        return { success: true };
      }
      return { success: false, error: res.data.error || 'Registration failed' };
    } catch (err: any) {
      console.error('Registration error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Registration failed. Please check details.'
      };
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    const cred = DEMO_CREDENTIALS[role];
    if (cred) {
      await login(cred.email);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('samadhansetu_token');
    localStorage.removeItem('samadhansetu_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        registerUser,
        logout,
        switchDemoRole,
        isAuthenticated: !!token && !!user,
        isFirstVisit,
        dismissFirstVisit
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
