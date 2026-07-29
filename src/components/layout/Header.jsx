import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_INFO } from '../../utils/constants';
import { Menu, X, User, LogOut, FileText, Home as HomeIcon, Award, ShieldCheck } from 'lucide-react';
import logoWebp from '../../assets/logo.webp';

export function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & College Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoWebp}
              alt={COLLEGE_INFO.name}
              onError={(e) => { e.target.src = '/logo.png'; }}
              className="h-12 sm:h-14 w-auto object-contain transition duration-200 group-hover:scale-105"
            />
            {/*<div className="hidden xl:block">
              <h1 className="text-lg font-extrabold text-tec-navy leading-tight tracking-tight">
                THIRUMALAI ENGINEERING COLLEGE
              </h1>
              <p className="text-xs text-slate-600 font-medium italic">
                "{COLLEGE_INFO.tagline}"
              </p>
            </div>*/}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${isActive('/')
                ? 'bg-slate-100 text-tec-navy font-bold'
                : 'text-slate-700 hover:text-tec-navy hover:bg-slate-50'
                }`}
            >
              Home
            </Link>
            {/*<Link
              to="/apply"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                isActive('/apply')
                  ? 'bg-tec-navy text-white shadow-xs'
                  : 'text-slate-700 hover:text-tec-navy hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Apply Online
            </Link>*/}
            <Link
              to="/status"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${isActive('/status')
                ? 'bg-slate-100 text-tec-navy font-bold'
                : 'text-slate-700 hover:text-tec-navy hover:bg-slate-50'
                }`}
            >
              Application Status
            </Link>
          </nav>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 pl-3 pr-2 py-1.5 rounded-full">
                <div className="w-7 h-7 rounded-full bg-tec-navy text-white flex items-center justify-center font-bold text-xs">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <button
                  onClick={logout}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            <HomeIcon className="w-5 h-5 text-tec-navy" />
            Home
          </Link>
          <Link
            to="/apply"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold bg-tec-navy text-white"
          >
            <FileText className="w-5 h-5" />
            Apply Online Form
          </Link>
          <Link
            to="/status"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            <ShieldCheck className="w-5 h-5 text-tec-navy" />
            Application Status
          </Link>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-800">{user.fullName}</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Log out
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
