import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COLLEGE_INFO, UG_PROGRAMS, PG_PROGRAMS } from '../utils/constants';
import { 
  Award, ShieldCheck, GraduationCap, ArrowRight, CheckCircle2, 
  Sparkles, BookOpen, Users, Clock, MapPin, Phone, Mail, Building2 
} from 'lucide-react';
import heroCampusJpg from '../assets/hero-campus.jpg';
import emblemPng from '../assets/emblem.png';

export function Home() {
  const [activeTab, setActiveTab] = useState('UG');
  const navigate = useNavigate();

  const handleApplyClick = (degree, deptName) => {
    navigate(`/apply?degree=${degree}&dept=${encodeURIComponent(deptName)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Banner */}
      <div className="relative bg-tec-navy-dark text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={heroCampusJpg}
            alt="TEC Campus"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-tec-navy-dark via-tec-navy/95 to-transparent z-1" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tec-gold/20 border border-tec-gold/40 text-tec-gold text-xs sm:text-sm font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>TNEA Counselling Code: {COLLEGE_INFO.counsellingCode}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {COLLEGE_INFO.name}
              </h1>

              <p className="text-lg sm:text-xl font-medium text-tec-gold-light italic">
                "{COLLEGE_INFO.tagline}"
              </p>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Step into a world of engineering and technological excellence at Thirumalai Engineering College, Kanchipuram. Empowering generations of tech leaders with quality education, modern infrastructure, and 100% placement support.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/apply"
                  className="px-6 py-3.5 rounded-lg bg-tec-gold hover:bg-tec-gold-hover text-slate-950 font-extrabold text-base shadow-lg hover:shadow-xl transition flex items-center gap-2"
                >
                  <span>Apply Now for 2026-27</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/status"
                  className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-base transition"
                >
                  Check Application Status
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-6 border-t border-slate-700/60 flex flex-wrap gap-4 text-xs text-slate-300">
                {COLLEGE_INFO.accreditation.map((acc, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tec-gold" />
                    {acc}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Card Emblem & Quick Stats */}
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 text-center text-white shadow-2xl space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-white p-3 shadow-inner flex items-center justify-center">
                  <img src={emblemPng} alt="TEC Emblem" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-tec-gold font-bold">Anna University Affiliated</span>
                  <h3 className="text-2xl font-black mt-1">CODE: 1517</h3>
                  <p className="text-xs text-slate-300 mt-1">Kilambi, Kanchipuram – 631551</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/10">
                    <span className="text-xl font-bold text-tec-gold">25+</span>
                    <p className="text-[11px] text-slate-300">Years Excellence</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/10">
                    <span className="text-xl font-bold text-tec-gold">14+</span>
                    <p className="text-[11px] text-slate-300">UG & PG Courses</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/10">
                    <span className="text-xl font-bold text-tec-gold">100%</span>
                    <p className="text-[11px] text-slate-300">Placement Cell</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/10">
                    <span className="text-xl font-bold text-tec-gold">A+ Labs</span>
                    <p className="text-[11px] text-slate-300">Modern Campus</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Why Choose TEC Section */}
      <div className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-tec-navy uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Why Thirumalai Engineering College?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              Empowering Students for Bright Futures
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Recognized as one of the best engineering institutions in Kanchipuram, offering career-focused education and state-of-the-art facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-tec-navy/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-lg bg-tec-navy text-white flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-tec-gold" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Premier Accreditation</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Affiliated with Anna University, approved by AICTE New Delhi, and certified under ISO 9001:2008 for quality educational standards.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-tec-navy/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-lg bg-tec-navy text-white flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-tec-gold" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cutting-Edge Infrastructure</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Advanced AI & Computing labs, high-tech engineering workshops, digital library, and campus-wide high-speed Wi-Fi network.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-tec-navy/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-lg bg-tec-navy text-white flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-tec-gold" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">100% Placement Guidance</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Dedicated training & placement cell providing soft skills, aptitude coaching, and direct campus recruitment by top MNCs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Offered Grid */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-tec-navy uppercase tracking-widest">Academic Programs</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                Explore Undergraduate & Postgraduate Degrees
              </h2>
            </div>

            {/* UG / PG Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-200 rounded-lg">
              <button
                onClick={() => setActiveTab('UG')}
                className={`px-5 py-2 rounded-md text-sm font-bold transition ${
                  activeTab === 'UG'
                    ? 'bg-tec-navy text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                UG Programs (8)
              </button>
              <button
                onClick={() => setActiveTab('PG')}
                className={`px-5 py-2 rounded-md text-sm font-bold transition ${
                  activeTab === 'PG'
                    ? 'bg-tec-navy text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                PG Programs (6)
              </button>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === 'UG' ? UG_PROGRAMS : PG_PROGRAMS).map((prog, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-tec-navy hover:shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-tec-navy text-[11px] font-bold">
                      {activeTab} Degree
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {activeTab === 'UG' ? '4 Years' : '2 Years'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-tec-navy transition leading-snug">
                    {prog}
                  </h3>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">TNEA Code 1517</span>
                  <button
                    onClick={() => handleApplyClick(activeTab, prog)}
                    className="text-xs font-bold text-tec-navy hover:text-tec-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Step-by-Step Admission Procedure */}
      <div className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Simple 4-Step Online Admission Flow
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Apply online from anywhere in Tamil Nadu & India in less than 10 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative">
              <span className="w-8 h-8 rounded-full bg-tec-navy text-white font-black text-sm flex items-center justify-center mb-3">1</span>
              <h4 className="font-bold text-slate-900 text-base">Register Account</h4>
              <p className="text-xs text-slate-600 mt-1">Create your profile with mobile number and verify via OTP.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative">
              <span className="w-8 h-8 rounded-full bg-tec-navy text-white font-black text-sm flex items-center justify-center mb-3">2</span>
              <h4 className="font-bold text-slate-900 text-base">Fill Application</h4>
              <p className="text-xs text-slate-600 mt-1">Complete personal, academic, 12th marks, and program preferences.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative">
              <span className="w-8 h-8 rounded-full bg-tec-navy text-white font-black text-sm flex items-center justify-center mb-3">3</span>
              <h4 className="font-bold text-slate-900 text-base">Upload Marksheets</h4>
              <p className="text-xs text-slate-600 mt-1">Attach 10th, 12th, TC, Community certificate & photo securely.</p>
            </div>

            <div className="p-5 rounded-xl border border-tec-gold/50 bg-amber-50/50 relative">
              <span className="w-8 h-8 rounded-full bg-tec-gold text-slate-950 font-black text-sm flex items-center justify-center mb-3">4</span>
              <h4 className="font-bold text-slate-900 text-base">Submit & Pay</h4>
              <p className="text-xs text-slate-600 mt-1">Submit application, pay application fee, and download application PDF.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
