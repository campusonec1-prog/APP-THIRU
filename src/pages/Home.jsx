import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDepartmentsList, getProgramsList } from '../Api';
import { COLLEGE_CONFIG } from '../Config/collegeConfig';
import {
  Award, ShieldCheck, ArrowRight, CheckCircle2,
  Sparkles, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { realtimeManager } from '../services/websocket';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const [activeTab, setActiveTab] = useState('UG');
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [programsMap, setProgramsMap] = useState({});
  const { user, showToast, academicYear } = useAuth();
  const displayYear = academicYear || COLLEGE_CONFIG.academicYear;
  const navigate = useNavigate();

  const fetchAcademicData = useCallback(async () => {
    try {
      setLoading(true);
      const [deptsData, progsData] = await Promise.all([
        getDepartmentsList().catch(() => []),
        getProgramsList().catch(() => []),
      ]);

      const rawDepts = Array.isArray(deptsData) ? deptsData : (deptsData?.data || []);
      const rawProgs = Array.isArray(progsData) ? progsData : (progsData?.data || []);

      const pMap = {};
      if (Array.isArray(rawProgs)) {
        rawProgs.forEach((p) => {
          pMap[p.id] = p;
        });
      }
      setProgramsMap(pMap);

      if (Array.isArray(rawDepts)) {
        setDepartments(rawDepts);
      }
    } catch (err) {
      console.error('Failed to fetch academic programs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicData();
  }, [fetchAcademicData]);

  // Subscribe to WebSocket updates for real-time live data changes without page refresh
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe((payload) => {
      console.log('[Home] Real-time WebSocket update received, refreshing live data:', payload);
      fetchAcademicData();
    });
    return unsubscribe;
  }, [fetchAcademicData]);

  const filteredDepartments = useMemo(() => {
    return departments
      .map((dept) => {
        const prog = programsMap[dept.program_id] || {};
        const level = prog.program_level || 'UG';
        const progName = prog.program_name || '';
        const duration = prog.duration ? `${prog.duration} Years` : (level === 'UG' ? '4 Years' : '2 Years');
        const displayName = progName ? `${progName} - ${dept.department_name}` : dept.department_name;
        return {
          ...dept,
          program_level: level,
          program_name: progName,
          displayName,
          duration,
        };
      })
      .filter((dept) => dept.program_level === activeTab);
  }, [departments, programsMap, activeTab]);

  const ugCount = useMemo(() => {
    return departments.filter(d => {
      const p = programsMap[d.program_id] || {};
      return (p.program_level || 'UG') === 'UG';
    }).length;
  }, [departments, programsMap]);

  const pgCount = useMemo(() => {
    return departments.filter(d => {
      const p = programsMap[d.program_id] || {};
      return p.program_level === 'PG';
    }).length;
  }, [departments, programsMap]);

  useEffect(() => {
    // Hero Entrance
    gsap.fromTo(
      '.gsap-hero-left',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
    );

    gsap.fromTo(
      '.gsap-hero-right',
      { opacity: 0, x: 30, scale: 0.96 },
      { opacity: 1, x: 0, scale: 1, duration: 0.9, delay: 0.2, ease: 'power3.out' }
    );

    // Features Section ScrollTrigger
    gsap.fromTo(
      '.gsap-feature-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.gsap-features-section',
          start: 'top 80%',
        },
      }
    );

    // Steps Section ScrollTrigger
    gsap.fromTo(
      '.gsap-step-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.gsap-steps-section',
          start: 'top 80%',
        },
      }
    );
  }, []);

  useEffect(() => {
    if (!loading && filteredDepartments.length > 0) {
      gsap.fromTo(
        '.gsap-course-card',
        { opacity: 0, y: 25, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power2.out',
        }
      );
    }
  }, [loading, activeTab, filteredDepartments]);

  const handleApplyClick = (degree, deptName = '', programId = null) => {
    if (user) {
      const url = programId
        ? `/application-form?program_id=${programId}&degree=${degree}&dept=${encodeURIComponent(deptName)}`
        : `/application-form?degree=${degree}&dept=${encodeURIComponent(deptName)}`;
      navigate(url);
    } else {
      showToast('Please log in to start your application.', 'info');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Banner */}
      <div className="relative bg-tec-navy-dark text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={COLLEGE_CONFIG.images.heroCampus}
            alt={`${COLLEGE_CONFIG.shortName} Campus`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-tec-navy-dark via-tec-navy/95 to-transparent z-1" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6 gsap-hero-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tec-gold/20 border border-tec-gold/40 text-tec-gold text-xs sm:text-sm font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>TNEA Counselling Code: {COLLEGE_CONFIG.counsellingCode}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {COLLEGE_CONFIG.heroHeading}
              </h1>

              <p className="text-lg sm:text-xl font-medium text-tec-gold-light italic">
                "{COLLEGE_CONFIG.tagline}"
              </p>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                {COLLEGE_CONFIG.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handleApplyClick('UG', '')}
                  className="px-6 py-3.5 rounded-lg bg-tec-gold hover:bg-tec-gold-hover text-slate-950 font-extrabold text-base shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Apply Now for {displayYear}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Badges */}
              <div className="pt-6 border-t border-slate-700/60 flex flex-wrap gap-4 text-xs text-slate-300">
                {COLLEGE_CONFIG.accreditation.map((acc, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tec-gold" />
                    {acc}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Card Emblem & Quick Stats */}
            <div className="lg:col-span-4 gsap-hero-right">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 text-center text-white shadow-2xl space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-white p-3 shadow-inner flex items-center justify-center">
                  <img src={COLLEGE_CONFIG.images.emblem} alt={`${COLLEGE_CONFIG.shortName} Emblem`} className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-tec-gold font-bold">{COLLEGE_CONFIG.accreditation[0]}</span>
                  <h3 className="text-2xl font-black mt-1">{COLLEGE_CONFIG.codeLabel}</h3>
                  <p className="text-xs text-slate-300 mt-1">{COLLEGE_CONFIG.location.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/10">
                    <span className="text-xl font-bold text-tec-gold">{COLLEGE_CONFIG.yearsExcellence}</span>
                    <p className="text-[11px] text-slate-300">Years Excellence</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/10">
                    <span className="text-xl font-bold text-tec-gold">{COLLEGE_CONFIG.coursesCount}</span>
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
      <div className="py-16 bg-white border-b border-slate-200 gsap-features-section">
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
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-tec-navy/30 hover:shadow-md transition gsap-feature-card">
              <div className="w-12 h-12 rounded-lg bg-tec-navy text-white flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-tec-gold" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Premier Accreditation</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Affiliated with Anna University, approved by AICTE New Delhi, and certified under ISO 9001:2008 for quality educational standards.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-tec-navy/30 hover:shadow-md transition gsap-feature-card">
              <div className="w-12 h-12 rounded-lg bg-tec-navy text-white flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-tec-gold" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cutting-Edge Infrastructure</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Advanced AI & Computing labs, high-tech engineering workshops, digital library, and campus-wide high-speed Wi-Fi network.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-tec-navy/30 hover:shadow-md transition gsap-feature-card">
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
                UG Programs ({ugCount})
              </button>
              <button
                onClick={() => setActiveTab('PG')}
                className={`px-5 py-2 rounded-md text-sm font-bold transition ${
                  activeTab === 'PG'
                    ? 'bg-tec-navy text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                PG Programs ({pgCount})
              </button>
            </div>
          </div>

          {/* Grid Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
              No programs found for {activeTab} Degree.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-tec-navy hover:shadow-lg transition flex flex-col justify-between group gsap-course-card"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded bg-blue-50 text-tec-navy text-[11px] font-bold">
                        {dept.program_level} Degree
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {dept.duration}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-tec-navy transition leading-snug">
                      {dept.displayName}
                    </h3>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {dept.department_code && dept.department_code !== '1517' ? `Code ${dept.department_code}` : 'TNEA Code 1517'}
                    </span>
                    <button
                      onClick={() => handleApplyClick(dept.program_level, dept.displayName, dept.program_id)}
                      className="text-xs font-bold text-tec-navy hover:text-tec-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Step-by-Step Admission Procedure */}
      <div className="py-16 bg-white border-t border-slate-200 gsap-steps-section">
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
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative gsap-step-card">
              <span className="w-8 h-8 rounded-full bg-tec-navy text-white font-black text-sm flex items-center justify-center mb-3">1</span>
              <h4 className="font-bold text-slate-900 text-base">Register Account</h4>
              <p className="text-xs text-slate-600 mt-1">Create your profile with mobile number and verify via OTP.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative gsap-step-card">
              <span className="w-8 h-8 rounded-full bg-tec-navy text-white font-black text-sm flex items-center justify-center mb-3">2</span>
              <h4 className="font-bold text-slate-900 text-base">Fill Application</h4>
              <p className="text-xs text-slate-600 mt-1">Complete personal, academic, 12th marks, and program preferences.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative gsap-step-card">
              <span className="w-8 h-8 rounded-full bg-tec-navy text-white font-black text-sm flex items-center justify-center mb-3">3</span>
              <h4 className="font-bold text-slate-900 text-base">Upload Marksheets</h4>
              <p className="text-xs text-slate-600 mt-1">Attach 10th, 12th, TC, Community certificate & photo securely.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative gsap-step-card">
              <span className="w-8 h-8 rounded-full bg-tec-navy text-white font-black text-sm flex items-center justify-center mb-3">4</span>
              <h4 className="font-bold text-slate-900 text-base">Submit & Pay</h4>
              <p className="text-xs text-slate-600 mt-1">Submit application, pay application fee, and download application PDF.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
