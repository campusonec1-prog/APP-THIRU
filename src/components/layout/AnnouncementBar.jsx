import React from 'react';
import { Phone, Mail, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_CONFIG } from '../../Config/collegeConfig';

export function AnnouncementBar() {
  const { academicYear } = useAuth();
  const displayYear = academicYear || COLLEGE_CONFIG.academicYear;

  return (
    <div className="bg-tec-navy-dark text-slate-200 text-xs py-2 px-4 border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: TNEA Code Badge */}
        <div className="flex items-center gap-2">
          <span className="bg-tec-gold text-slate-900 font-extrabold px-2.5 py-0.5 rounded text-[11px] tracking-wide uppercase shadow-xs">
            TNEA Code: {COLLEGE_CONFIG.counsellingCode}
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Admissions Open for Academic Session {displayYear}
          </span>
        </div>

        {/* Center: Accreditations */}
        <div className="hidden lg:flex items-center gap-3 text-slate-300 text-[11px]">
          {COLLEGE_CONFIG.accreditation.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>•</span>}
              <span className="flex items-center gap-1">
                {idx === 0 && <Award className="w-3.5 h-3.5 text-tec-gold" />}
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Right: Phone & Email */}
        <div className="flex items-center gap-4 text-slate-300">
          <a href={`tel:${COLLEGE_CONFIG.contact.phones[0]}`} className="flex items-center gap-1 hover:text-tec-gold transition">
            <Phone className="w-3 h-3 text-tec-gold" />
            <span>{COLLEGE_CONFIG.contact.phones[0]}</span>
          </a>
          <a href={`mailto:${COLLEGE_CONFIG.contact.email}`} className="hidden sm:flex items-center gap-1 hover:text-tec-gold transition">
            <Mail className="w-3 h-3 text-tec-gold" />
            <span>{COLLEGE_CONFIG.contact.email}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
