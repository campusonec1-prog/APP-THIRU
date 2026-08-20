import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getDepartmentsList, 
  getProgramsList, 
  getFormModulesList, 
  getFormFieldsList, 
  getCollegeHeadersList,
  downloadApplicationPDF
} from '../Api';
import { COLLEGE_CONFIG } from '../Config/collegeConfig';
import { ApplicationReview } from '../components/application/ApplicationReview';
import {
  User, Mail, Phone, FileText, ArrowRight,
  BookOpen, Inbox, ChevronRight, RefreshCw
} from 'lucide-react';

export function Status() {
  const { user, application, applications, refreshApplicationStatus, academicYear, showToast } = useAuth();
  const navigate = useNavigate();


  // Courses State (mirroring Home.jsx)
  const [activeTab, setActiveTab] = useState('UG');
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [programsMap, setProgramsMap] = useState({});
  const [modules, setModules] = useState([]);
  const [fields, setFields] = useState([]);
  const [collegeHeader, setCollegeHeader] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const handleDownloadPDF = async (app) => {
    if (!app?.id) return;
    try {
      setDownloading(app.id);
      if (showToast) showToast(`Generating application PDF for ${app.application_no || 'Form'}...`, 'info');
      const blobData = await downloadApplicationPDF(app.id);
      
      const fileBlob = new Blob([blobData], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `Application_${app.application_no || 'Form'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
      
      if (showToast) showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      if (showToast) showToast('Failed to download PDF. Please try again.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const fetchAcademicData = useCallback(async () => {
    try {
      setLoading(true);
      const [deptsData, progsData, modulesData, fieldsData, headersData] = await Promise.all([
        getDepartmentsList().catch(() => []),
        getProgramsList().catch(() => []),
        getFormModulesList().catch(() => []),
        getFormFieldsList().catch(() => []),
        getCollegeHeadersList().catch(() => []),
      ]);
      const rawDepts = Array.isArray(deptsData) ? deptsData : (deptsData?.data || []);
      const rawProgs = Array.isArray(progsData) ? progsData : (progsData?.data || []);
      const rawModules = Array.isArray(modulesData) ? modulesData : (modulesData?.data || []);
      const rawFields = Array.isArray(fieldsData) ? fieldsData : (fieldsData?.data || []);
      const rawHeaders = headersData?.results || 
                         headersData?.data?.results || 
                         (Array.isArray(headersData) ? headersData : 
                         (Array.isArray(headersData?.data) ? headersData.data : []));

      const pMap = {};
      rawProgs.forEach((p) => { pMap[p.id] = p; });
      setProgramsMap(pMap);
      setDepartments(rawDepts);

      const sortedModules = rawModules
        .filter((m) => m.is_active !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setModules(sortedModules);
      setFields(rawFields.filter((f) => f.is_active !== false));
      if (rawHeaders.length > 0) {
        setCollegeHeader(rawHeaders[0]);
      }
    } catch (err) {
      console.error('Failed to fetch academic programs & form schema:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicData();
    refreshApplicationStatus();
  }, [fetchAcademicData, refreshApplicationStatus]);

  const filteredDepartments = useMemo(() => {
    return departments
      .map((dept) => {
        const prog = programsMap[dept.program_id] || {};
        const level = prog.program_level || 'UG';
        const progName = prog.program_name || '';
        const duration = prog.duration ? `${prog.duration} Years` : (level === 'UG' ? '4 Years' : '2 Years');
        const displayName = progName ? `${progName} - ${dept.department_name}` : dept.department_name;
        return { ...dept, program_level: level, program_name: progName, displayName, duration };
      })
      .filter((dept) => dept.program_level === activeTab);
  }, [departments, programsMap, activeTab]);

  const ugCount = useMemo(() => departments.filter(d => (programsMap[d.program_id]?.program_level || 'UG') === 'UG').length, [departments, programsMap]);
  const pgCount = useMemo(() => departments.filter(d => programsMap[d.program_id]?.program_level === 'PG').length, [departments, programsMap]);

  // User display values
  const displayName = user?.fullName || user?.name || user?.username || 'Applicant';
  const displayEmail = user?.email || '—';
  const displayMobile = user?.phone_number || '—';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">View your account details and application status</p>
        </div>

        {/* Top Row: User Profile (left) + My Application (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left: User Info Card ── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              {/* Avatar + Name Banner */}
              <div className="bg-tec-navy px-6 pt-8 pb-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-tec-gold text-slate-950 flex items-center justify-center text-2xl font-black shadow-xl border-4 border-white mb-3">
                  {initials}
                </div>
                <h2 className="text-base font-extrabold text-white truncate">{displayName}</h2>
                <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-white/15 text-tec-gold text-xs font-bold border border-tec-gold/30">
                  Applicant
                </span>
              </div>

              {/* Contact Details */}
              <div className="px-5 py-5 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-tec-navy/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-tec-navy" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{displayEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-tec-navy/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-tec-navy" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{displayMobile}</p>
                  </div>
                </div>
              </div>

              {/* Apply CTA */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => navigate('/application-form')}
                  className="w-full px-4 py-2.5 rounded-xl bg-tec-navy hover:bg-tec-navy-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Fill Application Form</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: My Application Panel ── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 h-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">My Applications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Track your submitted application status</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-tec-navy/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-tec-navy" />
                </div>
              </div>

              {applications && applications.length > 0 ? (
                /* If applications exist */
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {applications.map((app) => {
                    const isDownloading = downloading === app.id;
                    const courseName = app.program_name || 'N/A';
                    const deptName = app.form_data?.course_selection?.department || '';
                    const fullDeptDisplayName = Array.isArray(deptName) ? deptName.join(', ') : deptName;

                    return (
                      <div key={app.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No:</span>
                            <span className="text-xs font-black text-tec-navy">{app.application_no || 'N/A'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              app.status_name === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              app.status_name === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {app.status_name || 'Pending'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 truncate">
                              {fullDeptDisplayName || courseName}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Applied on {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="no-print shrink-0">
                          <button
                            onClick={() => handleDownloadPDF(app)}
                            disabled={downloading !== null}
                            className="px-4 py-2 rounded-xl bg-tec-gold hover:bg-tec-gold-hover text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer border border-amber-300 disabled:opacity-50"
                          >
                            {isDownloading ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5 text-slate-950" />
                                <span>Download PDF</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* No application yet */
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <Inbox className="w-9 h-9 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-700">No applied applications yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      You have not submitted an application for admission yet. Click below to start your online application.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/application-form')}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-tec-navy hover:bg-tec-navy-dark text-white font-extrabold text-sm flex items-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Start Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Course List Section (like Home page) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-tec-navy uppercase tracking-widest">Academic Programs</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Courses Offered</h2>
              <p className="text-xs text-slate-500 mt-0.5">Explore UG &amp; PG programs available for {academicYear || COLLEGE_CONFIG.academicYear}</p>
            </div>

            {/* UG / PG Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('UG')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${
                  activeTab === 'UG' ? 'bg-tec-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                UG ({ugCount})
              </button>
              <button
                onClick={() => setActiveTab('PG')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${
                  activeTab === 'PG' ? 'bg-tec-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PG ({pgCount})
              </button>
            </div>
          </div>

          {/* Course Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-slate-50 rounded-xl border border-slate-200 p-5 animate-pulse space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-200">
              No programs found for {activeTab} Degree.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-tec-navy hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded bg-blue-50 text-tec-navy text-[11px] font-bold">
                        {dept.program_level}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{dept.duration}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-tec-navy transition leading-snug">
                      {dept.displayName}
                    </h3>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {dept.department_code && dept.department_code !== '1517' ? `Code ${dept.department_code}` : 'TNEA 1517'}
                    </span>
                    <button
                      onClick={() => navigate(`/application-form?degree=${dept.program_level}&dept=${encodeURIComponent(dept.displayName)}`)}
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

      {/* Print-Only Application Review View (Hidden on Screen, visible in Print layout) */}
      <div className="hidden print:block print-page">
        {application && (
          <ApplicationReview
            modules={modules}
            fields={fields}
            formValues={application.form_data}
            selectedProgramName={application.program_name}
            collegeHeader={collegeHeader}
          />
        )}
      </div>
    </div>
  );
}
