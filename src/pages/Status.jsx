import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApplicationStatus, updateMockStatus } from '../services/api';
import { COLLEGE_INFO } from '../utils/constants';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Printer, CreditCard, RefreshCw } from 'lucide-react';
import logoWebp from '../assets/logo.webp';

export function Status() {
  const { application, setApplication, showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getApplicationStatus();
      setApplication(res.application);
    } catch (err) {
      showToast('Failed to refresh status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await updateMockStatus(newStatus);
      setApplication(res.application);
      showToast(`Mock Status updated to "${newStatus}"`, 'info');
    } catch (e) {
      showToast('Failed to update mock status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const app = application || {
    applicationId: 'TEC-2026-8942',
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
    feePaid: false,
    personalDetails: { fullName: 'Karthik Raja S', dob: '2005-04-14', gender: 'Male', community: 'BC', aadharNo: '789012345678' },
    contactDetails: { address: '14, Temple Street', city: 'Kanchipuram', district: 'Kancheepuram', state: 'Tamil Nadu', pincode: '631501', mobile: '9876543210', email: 'karthik.tec2026@gmail.com' },
    academicDetails: { tenthPercentage: 89.5, twelfthPercentage: 92.4, cutoffScore: 188.0, physicsMarks: 94, chemistryMarks: 90, mathsMarks: 96 },
    programSelection: { degreeLevel: 'UG', department: 'B.Tech AI & Data Science' },
    entranceDetails: { counsellingCode: '1517', tneaAppNo: 'TNEA2026-98124' }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Non-printable Control Header */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Application Reference</span>
          <h2 className="text-xl font-extrabold text-tec-navy">{app.applicationId}</h2>
        </div>

        {/* Workflow State Tester Buttons for reviewers / backend team */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Test State:</span>
          {['Submitted', 'Under Review', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                app.status === st
                  ? 'bg-tec-navy text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            isLoading={loading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          {!app.feePaid && (
            <Link to="/payment">
              <Button variant="accent" size="sm" className="font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Pay Fee (₹500)</span>
              </Button>
            </Link>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="font-bold print-include"
          >
            <Printer className="w-4 h-4" />
            <span>Print Application PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Printable Application Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print-page">
        
        {/* Institutional Header Banner */}
        <div className="bg-tec-navy text-white p-6 sm:p-8 border-b-4 border-tec-gold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={logoWebp}
              alt="TEC Logo"
              onError={(e) => { e.target.src = '/logo.png'; }}
              className="h-16 w-auto object-contain bg-white p-1 rounded"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                THIRUMALAI ENGINEERING COLLEGE
              </h1>
              <p className="text-xs text-slate-300">
                Krishnapuram Post, Kilambi, Kancheepuram – 631551, Tamil Nadu
              </p>
              <p className="text-xs font-bold text-tec-gold mt-1">
                TNEA Counselling Code: {COLLEGE_INFO.counsellingCode} • Anna University Affiliated
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right no-print">
            <Badge status={app.status} className="text-sm px-3 py-1" />
          </div>
        </div>

        {/* Application Summary Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Status & Reference Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Application ID</span>
              <p className="text-2xl font-extrabold text-tec-navy">{app.applicationId}</p>
              <p className="text-xs text-slate-500">Submitted on: {new Date(app.submittedAt || Date.now()).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold block">Application Status</span>
                <Badge status={app.status} className="text-xs px-3 py-1" />
              </div>
              <div className="text-right border-l border-slate-200 pl-3">
                <span className="text-xs text-slate-500 font-bold block">Payment Status</span>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded ${app.feePaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {app.feePaid ? '✓ Fee Paid (₹500)' : '⚠️ Fee Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Program Preferences Card */}
          <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Course Choice Preferences ({app.programSelection?.degreeLevel || 'UG'})</span>
              <div className="space-y-1 text-xs text-slate-800 font-semibold">
                <p><span className="text-tec-navy font-bold">1st Choice:</span> {app.programSelection?.preference1 || app.programSelection?.department || 'Computer Science & Engineering'}</p>
                <p><span className="text-tec-navy font-bold">2nd Choice:</span> {app.programSelection?.preference2 || 'B.Tech AI & Data Science'}</p>
                <p><span className="text-tec-navy font-bold">3rd Choice:</span> {app.programSelection?.preference3 || 'Information Technology'}</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <span className="text-xs text-blue-900 font-bold block">TNEA Engineering Cutoff</span>
              <span className="text-2xl font-black text-tec-navy">
                {app.academicDetails?.cutoffScore || '188.00'} <span className="text-xs font-medium text-slate-500">/ 200</span>
              </span>
            </div>
          </div>

          {/* Grid Information Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Details Box */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-tec-navy uppercase tracking-wider border-b border-slate-200 pb-2">
                1. Personal Information
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Full Name:</span> <span className="font-bold text-slate-800">{app.personalDetails?.fullName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span> <span className="font-semibold text-slate-800">{app.personalDetails?.dob}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Gender:</span> <span className="font-semibold text-slate-800">{app.personalDetails?.gender}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Community:</span> <span className="font-semibold text-slate-800">{app.personalDetails?.community} ({app.personalDetails?.caste || 'Mudaliar'})</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Aadhar No.:</span> <span className="font-mono font-semibold text-slate-800">{app.personalDetails?.aadharNo}</span></div>
              </div>
            </div>

            {/* Contact Details Box */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-tec-navy uppercase tracking-wider border-b border-slate-200 pb-2">
                2. Contact & Address
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Mobile:</span> <span className="font-semibold text-slate-800">{app.contactDetails?.mobile}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-800">{app.contactDetails?.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Parent/Guardian:</span> <span className="font-semibold text-slate-800">{app.contactDetails?.parentName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Address:</span> <span className="font-semibold text-slate-800 text-right">{app.contactDetails?.address}, {app.contactDetails?.city}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Pincode:</span> <span className="font-semibold text-slate-800">{app.contactDetails?.pincode}</span></div>
              </div>
            </div>

            {/* Academic Qualifications Box */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 md:col-span-2">
              <h4 className="text-xs font-extrabold text-tec-navy uppercase tracking-wider border-b border-slate-200 pb-2">
                3. Academic Qualifications Breakdown
              </h4>
              
              <div className="space-y-4">
                {(app.qualifications || [
                  { level: 'SSLC (10th)', boardOrUniversity: 'State Board (Tamil Nadu)', institutionName: 'Govt Higher Secondary School', yearOfPassing: '2022', overallPercentage: 88.5, regulation: 'N/A', subjects: [{ subjectCode: '1001', subjectName: 'Mathematics', marksObtained: 92, maxMarks: 100 }, { subjectCode: '1002', subjectName: 'Science', marksObtained: 88, maxMarks: 100 }] },
                  { level: 'HSC (12th)', boardOrUniversity: 'State Board (Tamil Nadu)', institutionName: 'Govt Higher Secondary School', yearOfPassing: '2024', overallPercentage: 91.0, regulation: 'N/A', subjects: [{ subjectCode: '2001', subjectName: 'Mathematics', marksObtained: 94, maxMarks: 100 }, { subjectCode: '2002', subjectName: 'Physics', marksObtained: 92, maxMarks: 100 }, { subjectCode: '2003', subjectName: 'Chemistry', marksObtained: 90, maxMarks: 100 }] }
                ]).map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-slate-800 border-b border-slate-200/80 pb-1.5 gap-1">
                      <span className="text-tec-navy">{q.level} • {q.institutionName} ({q.boardOrUniversity}) {q.regulation && q.regulation !== 'N/A' && <span className="ml-1 text-[10px] bg-blue-100 text-tec-navy px-1.5 py-0.5 rounded">{q.regulation}</span>}</span>
                      <span className="text-slate-600 font-semibold">Passed: {q.yearOfPassing} | Overall: <strong className="text-tec-navy">{q.overallPercentage}%</strong></span>
                    </div>

                    {q.subjects && q.subjects.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Subject Breakdown:</span>
                        <div className="flex flex-wrap gap-2">
                          {q.subjects.map((sub, sIdx) => (
                            <span key={sIdx} className="bg-white px-2.5 py-1 rounded border border-slate-200 font-medium">
                              {sub.subjectCode && <strong className="text-tec-navy mr-1">[{sub.subjectCode}]</strong>}
                              {sub.subjectName}: <strong>{sub.marksObtained}</strong> / {sub.maxMarks}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Official Signatures Section for Printed PDF */}
          <div className="pt-8 mt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 w-40 mb-1"></div>
              <span>Applicant Signature</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-700">TNEA Code 1517</span>
              <span>Thirumalai Engineering College</span>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400 w-40 mb-1 ml-auto"></div>
              <span>Admissions Officer Signature</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
