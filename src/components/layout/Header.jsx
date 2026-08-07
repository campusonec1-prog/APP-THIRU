import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Menu, X, LogOut, FileText, ChevronDown } from 'lucide-react';
import { COLLEGE_CONFIG } from '../../Config/collegeConfig';

export function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userInitial = user?.fullName?.trim()?.[0]?.toUpperCase() || user?.email?.trim()?.[0]?.toUpperCase() || 'U';
  const userDisplayName = user?.fullName || user?.email || 'User';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & College Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={COLLEGE_CONFIG.images.logo}
              alt={COLLEGE_CONFIG.name}
              onError={(e) => { e.target.src = '/logo.png'; }}
              className="h-12 sm:h-14 w-auto object-contain transition duration-200 group-hover:scale-105"
            />
          </Link>

          {/* User Auth & Profile Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 pl-3 pr-3 py-1.5 rounded-full transition cursor-pointer shadow-xs"
                >
                  <div className="w-8 h-8 rounded-full bg-tec-navy text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    {userInitial}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {userDisplayName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{userDisplayName}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-tec-navy transition cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-tec-navy" />
                        <span>My Profile</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-tec-navy hover:bg-slate-100 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold bg-tec-gold hover:bg-tec-gold-hover text-slate-900 rounded-lg shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg w-full max-w-full overflow-hidden">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (user) {
                navigate('/application-form');
              } else {
                navigate('/login');
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold bg-tec-navy text-white text-left cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            Apply Online Form
          </button>


          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="space-y-2 pt-1">
                <div className="px-3 py-2 bg-slate-100 rounded-lg">
                  <span className="text-xs text-slate-400 block font-medium">Logged in as</span>
                  <span className="text-sm font-bold text-slate-800">{userDisplayName}</span>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 text-left"
                >
                  <FileText className="w-4 h-4 text-tec-navy" />
                  My Profile
                </button>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-2 py-2.5 text-xs sm:text-sm font-semibold text-tec-navy border border-tec-navy rounded-lg truncate"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-2 py-2.5 text-xs sm:text-sm font-bold bg-tec-gold text-slate-900 rounded-lg truncate"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
