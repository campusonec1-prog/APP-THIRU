import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser as apiLogin, getApplicationStatus, getAcademicYearsList, normalizeUser } from '../services/api';
import { realtimeManager } from '../services/websocket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
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
  const [toast, setToast] = useState(null);
  const [academicYearObj, setAcademicYearObj] = useState(null);
  const [academicYear, setAcademicYear] = useState('2026-2027');

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

  useEffect(() => {
    if (user) {
      getApplicationStatus()
        .then(res => res && setApplication(res.application || res))
        .catch(err => console.error('Failed to load application status', err));
    }
  }, [user]);

  // Subscribe to WebSocket real-time updates for dynamic background refreshes
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe((payload) => {
      console.log('[AuthContext] WebSocket update received:', payload);
      fetchAcademicYear();
      if (user) {
        getApplicationStatus()
          .then(res => res && setApplication(res.application || res))
          .catch(err => console.error('Failed to refresh application status on WS message', err));
      }
    });
    return unsubscribe;
  }, [user, fetchAcademicYear]);

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
    setUser(null);
    setApplication(null);
    showToast('Logged out of application portal.', 'info');
  };

  const refreshApplicationStatus = async () => {
    const res = await getApplicationStatus();
    setApplication(res.application);
    return res.application;
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      application,
      setApplication,
      academicYear,
      academicYearObj,
      login,
      logout,
      toast,
      showToast,
      refreshApplicationStatus
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
