import React from 'react';
import { Link } from 'react-router-dom';
import { COLLEGE_INFO } from '../../utils/constants';
import { MapPin, Phone, Mail, Globe, ShieldCheck } from 'lucide-react';
import logoWebp from '../../assets/logo.webp';

export function Footer() {
  return (
    <footer className="bg-tec-navy-dark text-slate-300 pt-12 pb-6 border-t-4 border-tec-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-700/60">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-lg inline-block shadow-sm">
              <img
                src={logoWebp}
                alt={COLLEGE_INFO.name}
                onError={(e) => { e.target.src = '/logo.png'; }}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Thirumalai Engineering College (TEC), established in 1999, is committed to empowering students through technical excellence and industry-aligned skills.
            </p>
            <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">TNEA Counselling Code</span>
                <span className="text-base font-extrabold text-tec-gold tracking-widest">{COLLEGE_INFO.counsellingCode}</span>
              </div>
              <ShieldCheck className="w-8 h-8 text-tec-gold/80" />
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
              Portal Links
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-tec-gold transition flex items-center gap-1.5">
                  › Home & Overview
                </Link>
              </li>
              <li>
                <Link to="/apply" className="hover:text-tec-gold transition flex items-center gap-1.5">
                  › Online Application Form 2026
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-tec-gold transition flex items-center gap-1.5">
                  › Track Application Status
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-tec-gold transition flex items-center gap-1.5">
                  › Student Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-tec-gold transition flex items-center gap-1.5">
                  › Register New Account
                </Link>
              </li>
              <li>
                <a href="https://thirumalaiengg.org" target="_blank" rel="noreferrer" className="hover:text-tec-gold transition flex items-center gap-1.5">
                  › Official College Website ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Programs Overview */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
              Featured Programs
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>• B.Tech AI & Data Science</li>
              <li>• B.E. Computer Science & Engg</li>
              <li>• B.E. Electronics & Comm. Engg</li>
              <li>• B.Tech Information Technology</li>
              <li>• Agricultural Engineering</li>
              <li>• Master of Computer Applications (MCA)</li>
              <li>• Master of Business Admin (MBA)</li>
              <li>• M.E. Construction Engg & Management</li>
            </ul>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
              Contact Admissions
            </h3>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-tec-gold shrink-0 mt-0.5" />
              <span>{COLLEGE_INFO.location.address}, {COLLEGE_INFO.location.pincode}, {COLLEGE_INFO.location.state}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-tec-gold shrink-0" />
              <div className="flex flex-col">
                <a href={`tel:${COLLEGE_INFO.contact.phones[0]}`} className="hover:text-tec-gold transition">{COLLEGE_INFO.contact.phones[0]}</a>
                <a href={`tel:${COLLEGE_INFO.contact.phones[1]}`} className="hover:text-tec-gold transition">{COLLEGE_INFO.contact.phones[1]}</a>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-tec-gold shrink-0" />
              <a href={`mailto:${COLLEGE_INFO.contact.email}`} className="hover:text-tec-gold transition">{COLLEGE_INFO.contact.email}</a>
            </div>

            {/* Social Media SVG Icons */}
            <div className="pt-2 flex items-center gap-3">
              <a href={COLLEGE_INFO.socials.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-800 hover:bg-tec-gold hover:text-slate-900 transition" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href={COLLEGE_INFO.socials.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-800 hover:bg-tec-gold hover:text-slate-900 transition" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
              </a>
              <a href={COLLEGE_INFO.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-800 hover:bg-tec-gold hover:text-slate-900 transition" title="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </a>
              <a href={COLLEGE_INFO.socials.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-800 hover:bg-tec-gold hover:text-slate-900 transition" title="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Thirumalai Engineering College (TEC). All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <span>Designed for Admissions & Academic Excellence</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

