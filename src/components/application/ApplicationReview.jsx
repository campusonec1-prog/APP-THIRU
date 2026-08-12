import React from 'react';
import { ShieldCheck, Edit3, FileText, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

/**
 * Format field value for display in review screen
 */
function renderValue(field, value) {
  if (value === undefined || value === null || value === '') {
    return <span className="text-slate-400 italic">Not provided</span>;
  }

  if (field.field_type === 'checkbox') {
    return value ? (
      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">Yes / Agreed</span>
    ) : (
      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-xs">No</span>
    );
  }

  if (field.field_type === 'file') {
    const rawFile = value instanceof File ? value : (value && value.file instanceof File ? value.file : null);
    const fileName = rawFile ? rawFile.name : (typeof value === 'string' ? value.split('/').pop() : (value?.name || 'File Attached'));
    const isUrl = typeof value === 'string' && value.startsWith('http');

    return (
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800">
        <FileText className="w-4 h-4 text-tec-navy shrink-0" />
        <span className="truncate max-w-[200px]">{fileName}</span>
        {rawFile && <span className="text-[10px] text-emerald-600 font-bold ml-auto shrink-0">(Ready for Upload)</span>}
        {isUrl && <span className="text-[10px] text-blue-600 font-bold ml-auto shrink-0">(Uploaded R2)</span>}
      </div>
    );
  }

  if (field.field_type === 'array') {
    if (!Array.isArray(value) || value.length === 0) {
      return <span className="text-slate-400 italic">No entries added</span>;
    }
    const cols = field.choices || field.columns || [];
    return (
      <div className="overflow-x-auto border border-slate-200 rounded-xl my-1">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-2">#</th>
              {cols.map((c, idx) => (
                <th key={c.key || idx} className="p-2">{c.label || c.key}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {value.map((row, rIdx) => (
              <tr key={rIdx}>
                <td className="p-2 font-bold text-slate-500">{rIdx + 1}</td>
                {cols.map((c, cIdx) => (
                  <td key={c.key || cIdx} className="p-2">{row[c.key] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <span className="font-semibold text-slate-900">{String(value)}</span>;
}

export function ApplicationReview({
  modules = [],
  fields = [],
  formValues = {},
  selectedProgramName = '',
  onEditModule,
  onBackToForm,
  onConfirmSubmit,
  submitting = false,
}) {
  return (
    <div className="space-y-6">
      
      {/* Review Screen Header Alert */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-extrabold text-amber-950">Review Your Application Before Final Submission</h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Please carefully verify all details below. No documents have been uploaded yet. You can click &quot;Edit Section&quot; to modify any section before final submission.
            </p>
          </div>
        </div>
      </div>

      {/* Program Summary Card */}
      <div className="bg-tec-navy text-white rounded-2xl p-6 shadow-md border-b-4 border-tec-gold flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-tec-gold">Target Academic Program</span>
          <h2 className="text-xl font-black mt-0.5">{selectedProgramName || 'Selected Admission Program'}</h2>
        </div>
        <button
          type="button"
          onClick={onBackToForm}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Form</span>
        </button>
      </div>

      {/* Modules Summaries */}
      <div className="space-y-6">
        {modules.map((mod, modIdx) => {
          const modFields = fields.filter((f) => f.form_module_id === mod.id);
          if (modFields.length === 0) return null;

          return (
            <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Step {modIdx + 1}: {mod.module_name || mod.name}
                  </h3>
                  {mod.description && <p className="text-xs text-slate-500">{mod.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onEditModule(modIdx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tec-navy/10 hover:bg-tec-navy hover:text-white text-tec-navy text-xs font-extrabold transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Section</span>
                </button>
              </div>

              {/* Module Fields Summary Grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {modFields.map((field) => {
                  const val = formValues[field.field_key];
                  const isFullWidth = field.field_type === 'array' || field.field_type === 'file' || field.field_type === 'textarea';

                  return (
                    <div
                      key={field.id || field.field_key}
                      className={`p-3 rounded-xl bg-slate-50/50 border border-slate-100 space-y-1 ${
                        isFullWidth ? 'sm:col-span-2' : 'col-span-1'
                      }`}
                    >
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {field.field_label} {field.required && <span className="text-rose-500">*</span>}
                      </span>
                      <div>{renderValue(field, val)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Final Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for Submission</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Clicking &quot;Confirm &amp; Submit Application&quot; will upload your documents and create your application.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBackToForm}
            disabled={submitting}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer border border-slate-200"
          >
            Back to Edit
          </button>

          <button
            type="button"
            onClick={onConfirmSubmit}
            disabled={submitting}
            className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-tec-gold hover:bg-tec-gold-hover text-slate-950 text-sm font-black flex items-center justify-center gap-2 shadow-xl transition cursor-pointer border border-amber-300 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Uploading &amp; Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Confirm &amp; Submit Application</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
