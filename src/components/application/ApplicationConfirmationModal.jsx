import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Copy, FileText, Check, AlertCircle } from 'lucide-react';
import { COLLEGE_CONFIG } from '../../Config/collegeConfig';
import { downloadApplicationPDF } from '../../Api';
import { useAuth } from '../../context/AuthContext';

export function ApplicationConfirmationModal({
  applicationData,
  onClose
}) {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!applicationData) return null;

  const appNo = applicationData.application_no || applicationData.applicationNo || applicationData.applicationId || 'UG260001';
  const candidateId = applicationData.candidate_id || applicationData.candidateId || applicationData.id || '101';
  const programId = applicationData.program_id || '1';

  const copyAppNo = () => {
    navigator.clipboard.writeText(appNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = async () => {
    const appId = applicationData.id || applicationData.applicationId;
    if (!appId) return;
    try {
      setDownloading(true);
      if (showToast) showToast('Generating application PDF...', 'info');
      const blobData = await downloadApplicationPDF(appId);
      
      const fileBlob = new Blob([blobData], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `Application_${appNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
      
      if (showToast) showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      if (showToast) showToast('Failed to download PDF. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-100 text-center space-y-6 relative overflow-hidden transform transition-all animate-scale-up">
        {/* Decorative Golden Line at the top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-tec-navy via-tec-gold to-tec-navy-light" />

        {/* Success Icon Section */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-25" />
          <div className="relative w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Submission Successful!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
            Your online application for admission has been registered successfully with <span className="font-bold text-slate-800">{COLLEGE_CONFIG.name}</span>.
          </p>
        </div>

        {/* Premium Reference Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Application Reference Card
            </span>
            <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-left w-full sm:w-auto">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Number</span>
              <span className="text-2xl font-black text-tec-navy tracking-wider font-mono">
                {appNo}
              </span>
            </div>

            <button
              type="button"
              onClick={copyAppNo}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer ${
                copied
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 text-xs text-left">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Candidate Reference ID</span>
              <span className="font-extrabold text-slate-800">#{candidateId}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Program Course ID</span>
              <span className="font-extrabold text-slate-800">Prog-{programId}</span>
            </div>
          </div>
        </div>

        {/* Alert Tip Banner */}
        <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 flex items-start gap-2.5 text-left text-[11px] text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="font-medium leading-normal">
            An official verification email has been sent. You can download a copy of this application right now or track its status from your dashboard.
          </p>
        </div>

        {/* Action Button Grid */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            disabled={downloading}
            className="flex-1 py-3 px-5 rounded-xl bg-tec-gold hover:bg-tec-gold-hover text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer border border-amber-300 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4.5 h-4.5 text-slate-950" />
                <span>Download PDF / Print</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex-1 py-3 px-5 rounded-xl bg-tec-navy hover:bg-tec-navy-dark text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <span>Go to My Profile</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
