import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser as apiLogin,
  getApplicationStatus,
  getAcademicYearsList,
  normalizeUser,
  subscribeColdStart
} from '../Api';
import { realtimeManager } from '../services/websocket';

const AuthContext = createContext();

const OBSOLETE_KEYS = [
  'tec_mock_db',
  'tec_ims_token',
  'tec_ims_user',
  'tec_ims_role',
  'tec_application',
  'tec_role',
  'tec_token',
];

function purgeObsoleteLocalStorage() {
  try {
    OBSOLETE_KEYS.forEach((key) => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Failed to purge obsolete localStorage keys:', e);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    purgeObsoleteLocalStorage();
    try {
      const stored = localStorage.getItem('tec_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const normalized = normalizeUser(parsed);
      if (JSON.stringify(normalized) !== stored) {
        localStorage.setItem('tec_user', JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      return null;
    }
  });

  const [application, setApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [toast, setToast] = useState(null);
  const [isServerWakingUp, setIsServerWakingUp] = useState(false);
  const [academicYearObj, setAcademicYearObj] = useState(null);
  const [academicYear, setAcademicYear] = useState('2026-2027');

  // Subscribe to Axios cold start status notifications & purge obsolete keys
  useEffect(() => {
    purgeObsoleteLocalStorage();
    const unsubscribe = subscribeColdStart((wakingUp) => {
      setIsServerWakingUp(wakingUp);
    });
    return unsubscribe;
  }, []);

  const fetchAcademicYear = useCallback(async () => {
    try {
      const data = await getAcademicYearsList();
      const list = Array.isArray(data) ? data : (data?.data || []);
      const displayYearObj = list.find((y) => y.is_display === true || y.is_display === 1);
      if (displayYearObj) {
        setAcademicYearObj(displayYearObj);
        if (displayYearObj.academic_year) {
          setAcademicYear(displayYearObj.academic_year);
        }
      }
    } catch (err) {
      console.error('Failed to fetch academic years list:', err);
    }
  }, []);

  useEffect(() => {
    fetchAcademicYear();
  }, [fetchAcademicYear]);

  const refreshApplicationStatus = useCallback(async () => {
    if (!user) return null;
    try {
      const res = await getApplicationStatus();
      let appData = res?.data || res?.application || res;
      let allApps = [];
      if (appData && typeof appData === 'object' && Array.isArray(appData.results)) {
        allApps = appData.results;
      } else if (Array.isArray(appData)) {
        allApps = appData;
      } else if (appData) {
        allApps = [appData];
      }
      
      setApplications(allApps);
      const latestApp = allApps[0] || null;
      setApplication(latestApp);
      return latestApp;
    } catch (err) {
      console.error('Failed to refresh application status:', err);
      return null;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshApplicationStatus();
    }
  }, [user, refreshApplicationStatus]);

  // Subscribe to WebSocket real-time updates for dynamic background refreshes
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe((payload) => {
      console.log('[AuthContext] WebSocket update received:', payload);
      fetchAcademicYear();
      if (user) {
        refreshApplicationStatus();
      }
    });
    return unsubscribe;
  }, [user, fetchAcademicYear, refreshApplicationStatus]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    setUser(response);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('tec_user');
    localStorage.removeItem('tec_application_draft');
    purgeObsoleteLocalStorage();
    setUser(null);
    setApplication(null);
    setApplications([]);
    showToast('Logged out of application portal.', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      application,
      setApplication,
      applications,
      setApplications,
      academicYear,
      academicYearObj,
      login,
      logout,
      toast,
      showToast,
      refreshApplicationStatus,
      isServerWakingUp
    }}>
      {children}

      {/* Global Toast Component */}
      {toast && (
        <div className="fixed top-4 right-4 sm:right-6 z-50 transition-all transform ease-out duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-2xl text-white font-semibold flex items-center gap-3 border border-white/20 ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
          }`}>
            <span className="text-sm">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75 font-extrabold text-base cursor-pointer">✕</button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
