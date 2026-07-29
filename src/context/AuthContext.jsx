import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, getApplicationStatus } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tec_user') || 'null');
    } catch {
      return null;
    }
  });

  const [application, setApplication] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      getApplicationStatus()
        .then(res => setApplication(res.application))
        .catch(err => console.error('Failed to load application status', err));
    }
  }, [user]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    setUser(response.user);
    showToast('Logged in successfully!', 'success');
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
      login,
      logout,
      toast,
      showToast,
      refreshApplicationStatus
    }}>
      {children}
      {/* Global Toast Component */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all transform ease-out duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-xl text-white font-medium flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75 font-bold">✕</button>
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
