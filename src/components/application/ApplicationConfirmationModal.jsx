import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Copy, FileText } from 'lucide-react';
import { COLLEGE_CONFIG } from '../../Config/collegeConfig';

export function ApplicationConfirmationModal({
  applicationData,
  onClose
}) {
  const navigate = useNavigate();

  if (!applicationData) return null;

  const appNo = applicationData.application_no || applicationData.applicationNo || applicationData.applicationId || 'UG260001';
  const candidateId = applicationData.candidate_id || applicationData.candidateId || applicationData.id || '101';
  const programId = applicationData.program_id || '1';

  const copyAppNo = () => {
    navigator.clipboard.writeText(appNo);
    alert('Application Number copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-6 animate-scale-up">
        
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border-4 border-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Application Submitted!</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Your admission application has been registered with {COLLEGE_CONFIG.name}.
          </p>
        </div>

        {/* Highlighted Application Number Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-tec-navy/30 space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-tec-navy/10 text-tec-navy text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Application Reference</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-black text-tec-navy tracking-wider font-mono">
              {appNo}
            </span>
            <button
              type="button"
              onClick={copyAppNo}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Copy Application Number"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 text-slate-500">
            <div>
              <span className="block font-medium">Candidate ID:</span>
              <span className="font-bold text-slate-800">#{candidateId}</span>
            </div>
            <div>
              <span className="block font-medium">Program ID:</span>
              <span className="font-bold text-slate-800">Prog-{programId}</span>
            </div>
          </div>
        </div>

        {/* Notice text */}
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please keep your application number safe for future reference. Next step is completing your application fee payment.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/payment')}
            className="w-full py-3.5 px-6 rounded-xl bg-tec-gold hover:bg-tec-gold-hover text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer border border-amber-300"
          >
            <span>Proceed to Fee Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer border border-slate-200"
          >
            <FileText className="w-4 h-4" />
            <span>View My Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
