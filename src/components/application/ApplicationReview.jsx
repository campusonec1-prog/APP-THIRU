import React from 'react';
import { ShieldCheck, Edit3, FileText, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { COLLEGE_CONFIG } from '../../Config/collegeConfig';

/**
 * Format field value for display in review screen
 */
const STATE_NAME_TO_CODE = {
  'tamil nadu': 'TN',
  'kerala': 'KL',
  'karnataka': 'KA',
  'andhra pradesh': 'AP',
  'telangana': 'TS',
  'puducherry': 'PY',
  'pondicherry': 'PY'
};

function normalizeStateValue(val) {
  if (!val) return '';
  const lower = String(val).trim().toLowerCase();
  return STATE_NAME_TO_CODE[lower] || val;
}

function findParentValue(fieldKey, choices, formValues) {
  if (!choices || typeof choices !== 'object' || Array.isArray(choices)) {
    return null;
  }
  
  const keyMap = {};
  for (const key of Object.keys(choices)) {
    keyMap[key.toLowerCase()] = key;
  }
  const possibleParentKeys = Object.keys(keyMap);
  if (possibleParentKeys.length === 0) return null;
  
  const prefixes = ['', 'permanent_', 'communication_', 'present_', 'native_', 'parent_'];
  const baseNames = ['state', 'country', 'region', 'nationality', 'category'];
  
  let currentPrefix = '';
  for (const pf of prefixes) {
    if (pf && fieldKey.startsWith(pf)) {
      currentPrefix = pf;
      break;
    }
  }
  
  for (const base of baseNames) {
    const candidateKey = currentPrefix + base;
    const candidateVal = formValues[candidateKey];
    if (candidateVal) {
      const normalized = normalizeStateValue(candidateVal);
      const lowerVal = String(normalized).toLowerCase();
      if (possibleParentKeys.includes(lowerVal)) {
        return keyMap[lowerVal];
      }
    }
  }

  let bestMatchVal = null;
  let highestScore = -1;
  
  for (const fKey of Object.keys(formValues)) {
    const val = String(formValues[fKey] || '');
    if (val) {
      const normalized = normalizeStateValue(val);
      const lowerVal = normalized.toLowerCase();
      if (possibleParentKeys.includes(lowerVal)) {
        let score = 0;
        if (currentPrefix && fKey.startsWith(currentPrefix)) score += 10;
        if (fKey.toLowerCase().includes('state')) score += 5;
        if (fKey.toLowerCase() === 'state') score += 8;
        
        if (score > highestScore) {
          highestScore = score;
          bestMatchVal = keyMap[lowerVal];
        }
      }
    }
  }
  
  return bestMatchVal;
}

function renderValue(field, value, formValues = {}) {
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

    // Determine columns dynamically if field.choices or field.columns is missing or incomplete
    let cols = Array.isArray(field.choices) && field.choices.length > 0
      ? field.choices
      : (Array.isArray(field.columns) && field.columns.length > 0 ? field.columns : []);

    if (cols.length === 0 && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      cols = Object.keys(value[0]).map((k) => ({ key: k, label: k.replace(/_/g, ' ').toUpperCase() }));
    }

    return (
      <div className="overflow-x-auto border border-slate-200 rounded-xl my-1 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-2.5 w-10">#</th>
              {cols.map((c, idx) => (
                <th key={c.key || idx} className="p-2.5">{c.label || c.key}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {value.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-500">{rIdx + 1}</td>
                {cols.map((c, cIdx) => {
                  const cellVal = row ? row[c.key] : null;

                  // Safely handle file / object cells inside array tables (e.g. certificates document field)
                  if (cellVal && typeof cellVal === 'object') {
                    const rawFile = cellVal instanceof File ? cellVal : (cellVal.file instanceof File ? cellVal.file : null);
                    const fileName = rawFile ? rawFile.name : (cellVal.name || cellVal.url || (typeof cellVal === 'string' ? cellVal.split('/').pop() : 'File Attached'));
                    return (
                      <td key={c.key || cIdx} className="p-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-tec-navy shrink-0" />
                          <span className="truncate max-w-[150px]">{fileName}</span>
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td key={c.key || cIdx} className="p-2.5 font-medium text-slate-800">
                      {cellVal !== undefined && cellVal !== null && cellVal !== '' ? String(cellVal) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (field.field_type === 'select' || field.field_type === 'radio') {
    let label = value;
    if (field.choices) {
      if (Array.isArray(field.choices)) {
        const opt = field.choices.find(o => {
          if (typeof o === 'object' && o !== null) {
            return String(o.value ?? o.id ?? o.key ?? o.name ?? '') === String(value);
          }
          return String(o) === String(value);
        });
        if (opt) {
          label = typeof opt === 'object' ? (opt.label ?? opt.name ?? opt.display ?? value) : opt;
        }
      } else if (typeof field.choices === 'object') {
        const parentVal = findParentValue(field.field_key, field.choices, formValues);
        const resolvedList = field.choices[parentVal] || [];
        let opt = resolvedList.find(o => {
          if (typeof o === 'object' && o !== null) {
            return String(o.value ?? o.id ?? o.key ?? o.name ?? '') === String(value);
          }
          return String(o) === String(value);
        });
        
        if (!opt) {
          // Fallback search in all lists
          for (const key of Object.keys(field.choices)) {
            const list = field.choices[key] || [];
            const foundOpt = list.find(o => {
              if (typeof o === 'object' && o !== null) {
                return String(o.value ?? o.id ?? o.key ?? o.name ?? '') === String(value);
              }
              return String(o) === String(value);
            });
            if (foundOpt) {
              opt = foundOpt;
              break;
            }
          }
        }
        
        if (opt) {
          label = typeof opt === 'object' ? (opt.label ?? opt.name ?? opt.display ?? value) : opt;
        }
      }
    }
    return <span className="font-semibold text-slate-900">{String(label)}</span>;
  }

  if (typeof value === 'object' && value !== null) {
    return <span className="font-semibold text-slate-900">{JSON.stringify(value)}</span>;
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
  collegeHeader = null,
}) {
  const [localPhotoBlob, setLocalPhotoBlob] = React.useState(null);

  // Dynamically generate a temporary object URL if the user uploaded a raw File object that is not yet serialized
  React.useEffect(() => {
    let rawFile = null;
    if (formValues.photo) {
      if (formValues.photo instanceof File) {
        rawFile = formValues.photo;
      } else if (formValues.photo.file instanceof File) {
        rawFile = formValues.photo.file;
      }
    }
    
    if (!rawFile) {
      const certs = formValues.certificates || [];
      const photoCert = certs.find(
        (c) =>
          c &&
          (c.certificate_type === 'Passport Size Photo' ||
            c.document_type === 'Passport Size Photo' ||
            c.name === 'Passport Size Photo')
      );
      if (photoCert) {
        if (photoCert.document instanceof File) {
          rawFile = photoCert.document;
        } else if (photoCert.document?.file instanceof File) {
          rawFile = photoCert.document.file;
        }
      }
    }
    
    if (rawFile) {
      try {
        const blobUrl = URL.createObjectURL(rawFile);
        setLocalPhotoBlob(blobUrl);
        return () => {
          URL.revokeObjectURL(blobUrl);
        };
      } catch (e) {
        console.error('Failed to create object URL for photo:', e);
      }
    } else {
      setLocalPhotoBlob(null);
    }
  }, [formValues]);

  // Extract photo URL from formValues or certificates list
  const photoUrl = React.useMemo(() => {
    if (localPhotoBlob) return localPhotoBlob;

    if (formValues.photo) {
      if (typeof formValues.photo === 'string') return formValues.photo;
      if (typeof formValues.photo === 'object') {
        const url = formValues.photo.previewUrl || formValues.photo.url;
        if (url && typeof url === 'string') return url;
      }
    }
    
    const certs = formValues.certificates || [];
    const photoCert = certs.find(
      (c) =>
        c &&
        (c.certificate_type === 'Passport Size Photo' ||
          c.document_type === 'Passport Size Photo' ||
          c.name === 'Passport Size Photo')
    );
    
    if (photoCert) {
      if (photoCert.document) {
        if (typeof photoCert.document === 'string') return photoCert.document;
        if (typeof photoCert.document === 'object') {
          const url = photoCert.document.previewUrl || photoCert.document.url;
          if (url && typeof url === 'string') return url;
        }
      }
      if (typeof photoCert === 'string') return photoCert;
      const url = photoCert.previewUrl || photoCert.url;
      if (url && typeof url === 'string') return url;
    }
    
    return null;
  }, [formValues, localPhotoBlob]);

  return (
    <div className="space-y-6">
      
      {/* Official College Application Form Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative Golden Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-tec-gold" />

        {/* Left Side: Logo */}
        <div className="flex flex-col items-center shrink-0">
          <img src={collegeHeader?.primary_logo || COLLEGE_CONFIG.images.logo} alt="College Logo" className="w-20 h-20 object-contain" />
          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">ESTD. 1999</span>
        </div>

        {/* Middle: College Information */}
        <div className="text-center flex-grow space-y-1.5">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
            {collegeHeader?.college_name || COLLEGE_CONFIG.name}
          </h1>
          <p className="text-[11px] font-bold text-slate-700 leading-tight">
            (Approved by AICTE & Govt. of Tamilnadu, Affiliated to Anna University)
          </p>
          <p className="text-[11px] font-semibold text-slate-500">
            {collegeHeader?.address || 'Kilambi, Krishnapuram Post - 631 551, Kancheepuram Taluk & District, Tamil Nadu.'}
          </p>
          
          <div className="pt-1.5">
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black text-tec-navy uppercase tracking-wider">
              Application Form for Admission to B.E. / B.Tech. / M.E. / MBA / MCA Degree Course
            </span>
          </div>
        </div>

        {/* Right Side: Passport Size Photo Box */}
        <div className="shrink-0 flex flex-col items-center">
          {photoUrl ? (
            <div className="relative w-24 h-28 border border-emerald-300 rounded-lg overflow-hidden bg-slate-50 shadow-sm flex items-center justify-center">
              <img src={photoUrl} alt="Passport Photo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-28 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-400 font-bold leading-tight">
              <span className="block mb-1">Affix</span>
              <span className="block">Passport Size</span>
              <span className="block">Photo</span>
            </div>
          )}
        </div>
      </div>

      {/* Applied For & Back Button Row (Before Step 1) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-tec-navy uppercase tracking-widest block">Course Applied For</span>
          <h3 className="text-lg font-black text-slate-900 mt-1">{selectedProgramName || 'Selected Academic Program'}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Admission application under Academic Year {COLLEGE_CONFIG.academicYear || '2026-27'}</p>
        </div>
        <button
          type="button"
          onClick={onBackToForm}
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 hover:border-slate-400 text-xs font-bold transition shadow-xs cursor-pointer shrink-0 self-start sm:self-center"
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
                      <div>{renderValue(field, val, formValues)}</div>
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
