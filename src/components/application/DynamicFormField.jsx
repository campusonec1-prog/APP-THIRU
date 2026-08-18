import React from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { FileUpload } from '../common/FileUpload';
import { Plus, Trash2, Check } from 'lucide-react';

/**
 * Normalize options from various backend formats into { value, label } objects.
 * Handles: array of strings, array of objects, comma-separated string, single string, etc.
 */
function normalizeOptions(rawOptions) {
  // If it's already a proper array
  if (Array.isArray(rawOptions) && rawOptions.length > 0) {
    return rawOptions.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return { value: opt.value ?? opt.id ?? opt.key ?? opt.name ?? '', label: opt.label ?? opt.name ?? opt.display ?? String(opt.value ?? '') };
      }
      return { value: String(opt), label: String(opt) };
    });
  }

  // If it's a comma-separated string like "Male,Female,Other"
  if (typeof rawOptions === 'string' && rawOptions.trim().length > 0) {
    return rawOptions.split(',').map((s) => s.trim()).filter(Boolean).map((s) => ({ value: s, label: s }));
  }

  return [];
}

/**
 * Format Aadhaar number: 1234 5678 9012
 */
function formatAadhaar(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Format Indian mobile/phone number: 12345 67890
 */
function formatMobile(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return digits.slice(0, 5) + ' ' + digits.slice(5);
}

/**
 * Detect if a field key relates to mobile/phone number
 */
function isMobileField(key) {
  const k = (key || '').toLowerCase();
  return k.includes('mobile') || k.includes('phone') || k.includes('contact_number') || k.includes('whatsapp');
}

/**
 * Detect if a field key relates to aadhaar
 */
function isAadhaarField(key) {
  const k = (key || '').toLowerCase();
  return k.includes('aadhaar') || k.includes('aadhar') || k.includes('aadar') || k.includes('uid_number');
}

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

export function DynamicFormField({
  field,
  value,
  onChange,
  error,
  uploadProgress,
  onAddArrayRow,
  onRemoveArrayRow,
  onArrayRowChange,
  programLevel = 'UG',
  formValues = {}
}) {
  const {
    field_key,
    field_label,
    field_type = 'text',
    required = false,
    placeholder = '',
    options = [],
    description = '',
    columns = []
  } = field;

  const isDependent = field.choices && !Array.isArray(field.choices) && typeof field.choices === 'object';
  const parentVal = React.useMemo(() => {
    if (!isDependent) return null;
    return findParentValue(field_key, field.choices, formValues);
  }, [isDependent, field_key, field.choices, formValues]);

  React.useEffect(() => {
    if (isDependent && value) {
      const parentChoices = field.choices[parentVal] || [];
      const normalized = normalizeOptions(parentChoices);
      const isValid = normalized.some((opt) => String(opt.value) === String(value));
      if (!isValid) {
        onChange(field_key, '');
      }
    }
  }, [isDependent, parentVal, value, field.choices, field_key, onChange]);

  // Synchronize qualifications rows strictly based on UG / PG program selection
  const isQualifications = field_key === 'qualifications' || field_key === 'academic_qualification' || field_key.includes('qualification');
  const isPg = String(programLevel || '').toUpperCase() === 'PG';
  const targetCount = isPg ? 3 : 2;

  React.useEffect(() => {
    if (field_type === 'array' && isQualifications) {
      let currentList = Array.isArray(value) ? value : [];
      let needsSync = currentList.length !== targetCount;

      const synced = [];
      // Row 0: SSLC (Fixed)
      synced[0] = {
        qualification: 'SSLC',
        institution: currentList[0]?.institution || '',
        board: currentList[0]?.board || '',
        register_number: currentList[0]?.register_number || '',
        year_of_passing: currentList[0]?.year_of_passing || '',
        percentage: currentList[0]?.percentage || '',
      };

      // Row 1: HSC or Diploma (Default 'HSC')
      const r1Qual = (currentList[1]?.qualification === 'Diploma' || currentList[1]?.qualification === 'HSC') ? currentList[1].qualification : 'HSC';
      synced[1] = {
        qualification: r1Qual,
        institution: currentList[1]?.institution || '',
        board: currentList[1]?.board || '',
        register_number: currentList[1]?.register_number || '',
        year_of_passing: currentList[1]?.year_of_passing || '',
        percentage: currentList[1]?.percentage || '',
      };

      // Row 2: UG (Only if PG)
      if (isPg) {
        synced[2] = {
          qualification: 'UG',
          institution: currentList[2]?.institution || '',
          board: currentList[2]?.board || '',
          register_number: currentList[2]?.register_number || '',
          year_of_passing: currentList[2]?.year_of_passing || '',
          percentage: currentList[2]?.percentage || '',
        };
      }

      if (needsSync || JSON.stringify(synced) !== JSON.stringify(currentList)) {
        onChange(field_key, synced);
      }
    }
  }, [field_type, isQualifications, isPg, targetCount, value, field_key, onChange]);

  // Render Special Custom Component for Academic Performance Marks (Matching paper format)
  if (field_key === 'academic_performance' || field_key.includes('performance')) {
    return (
      <AcademicPerformanceRenderer
        field_label={field_label}
        required={required}
        value={value}
        onChange={onChange}
        error={error}
        programLevel={programLevel}
        formValues={formValues}
      />
    );
  }

  // Render Special Custom Component for Certificates Repeater (Default 5/6 compulsory rows + optional extra rows)
  if (field_key === 'certificates' || field_key.includes('certificate')) {
    return (
      <CertificatesRenderer
        field_label={field_label}
        required={required}
        value={value}
        onChange={onChange}
        error={error}
        programLevel={programLevel}
        formValues={formValues}
        uploadProgress={uploadProgress}
        onAddArrayRow={onAddArrayRow}
        onRemoveArrayRow={onRemoveArrayRow}
        onArrayRowChange={onArrayRowChange}
      />
    );
  }

  // Render File Upload Field
  if (field_type === 'file') {
    // If value is a URL string, normalize it into preview format for FileUpload
    let fileVal = value;
    if (typeof value === 'string' && value.startsWith('http')) {
      const fileName = value.split('/').pop() || 'uploaded_document';
      const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
      fileVal = {
        name: fileName,
        previewUrl: isImg ? value : null,
        url: value,
        size: 'Server Uploaded'
      };
    }

    return (
      <FileUpload
        label={field_label}
        required={required}
        value={fileVal}
        uploadProgress={uploadProgress}
        onChange={(file) => onChange(field_key, file)}
        error={error}
        helperText={description}
      />
    );
  }

  // Render Radio Group Field
  if (field_type === 'radio') {
    const formattedOptions = normalizeOptions(options);
    let finalOptions = [];
    if (formattedOptions.length > 0) {
      finalOptions = formattedOptions;
    } else if (field.choices) {
      if (Array.isArray(field.choices) || typeof field.choices === 'string') {
        finalOptions = normalizeOptions(field.choices);
      } else if (typeof field.choices === 'object') {
        const parentChoices = field.choices[parentVal] || [];
        finalOptions = normalizeOptions(parentChoices);
      }
    }

    const disabled = isDependent && !parentVal;

    return (
      <div className="w-full space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          {field_label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          {finalOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field_key}
                value={opt.value}
                checked={String(value || '') === String(opt.value)}
                onChange={(e) => onChange(field_key, e.target.value)}
                disabled={disabled}
                className="h-4 w-4 text-tec-navy focus:ring-tec-navy border-slate-300 cursor-pointer disabled:opacity-50"
              />
              <span className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>{opt.label}</span>
            </label>
          ))}
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}
        {!error && description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>
    );
  }

  // Render Select / Dropdown Field
  if (field_type === 'select') {
    const formattedOptions = normalizeOptions(options);
    let finalOptions = [];
    if (formattedOptions.length > 0) {
      finalOptions = formattedOptions;
    } else if (field.choices) {
      if (Array.isArray(field.choices) || typeof field.choices === 'string') {
        finalOptions = normalizeOptions(field.choices);
      } else if (typeof field.choices === 'object') {
        const parentChoices = field.choices[parentVal] || [];
        finalOptions = normalizeOptions(parentChoices);
      }
    }

    const displayPlaceholder = isDependent && !parentVal
      ? 'Select Parent Field First'
      : (placeholder || `Select ${field_label}`);

    return (
      <Select
        label={field_label}
        required={required}
        options={finalOptions}
        placeholder={displayPlaceholder}
        value={value || ''}
        onChange={(e) => onChange(field_key, e.target.value)}
        error={error}
        helperText={description}
        disabled={isDependent && !parentVal}
      />
    );
  }

  // Render Textarea Field
  if (field_type === 'textarea') {
    return (
      <div className="w-full col-span-full">
        {field_label && (
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {field_label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          placeholder={placeholder || `Enter ${field_label}`}
          value={value || ''}
          onChange={(e) => onChange(field_key, e.target.value)}
          rows={3}
          className={`w-full rounded-xl border p-3 text-sm transition focus:outline-none focus:ring-2 ${error
              ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/30'
              : 'border-slate-300 focus:border-tec-navy focus:ring-tec-navy/20'
            }`}
        />
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}
        {!error && description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>
    );
  }

  // Render Checkbox Field
  if (field_type === 'checkbox') {
    return (
      <div className="w-full space-y-1">
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(field_key, e.target.checked)}
            className="h-4 w-4 text-tec-navy focus:ring-tec-navy border-slate-300 rounded cursor-pointer"
          />
          <span className="text-sm font-semibold text-slate-700">
            {field_label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}
        {!error && description && (
          <p className="text-xs text-slate-500 ml-6">{description}</p>
        )}
      </div>
    );
  }

  // Render Array / Repeater Table Field (e.g., marks, qualifications)
  if (field_type === 'array') {
    const list = Array.isArray(value) ? value : [];
    const isQualifications = field_key === 'qualifications' || field_key === 'academic_qualification' || field_key.includes('qualification');
    const isPg = String(programLevel || '').toUpperCase() === 'PG';

    const cols = (field.choices && field.choices.length > 0) ? field.choices : (columns && columns.length > 0 ? columns : [
      { key: 'qualification', label: 'Qualification', type: 'select', options: ['SSLC', 'HSC', 'Diploma', 'UG'] },
      { key: 'institution', label: 'School / College', type: 'text' },
      { key: 'board', label: 'Board / University', type: 'text' },
      { key: 'register_number', label: 'Register Number', type: 'text' },
      { key: 'year_of_passing', label: 'Year of Passing', type: 'number' },
      { key: 'percentage', label: 'Percentage', type: 'number' }
    ]);


    return (
      <div className="w-full space-y-3 col-span-full">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-800">
            {field_label} {required && <span className="text-rose-500">*</span>}
          </label>
          {!isQualifications ? (
            <button
              type="button"
              onClick={() => onAddArrayRow && onAddArrayRow(field_key, cols)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tec-navy hover:bg-tec-navy-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-full bg-tec-navy/10 text-tec-navy text-xs font-extrabold border border-tec-navy/20">
              {isPg ? '3 Mandatory Qualifications (PG)' : '2 Mandatory Qualifications (UG)'}
            </span>
          )}
        </div>

        {list.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center text-xs text-slate-500">
            Initializing qualifications table...
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-3">#</th>
                  {cols.map((col) => (
                    <th key={col.key} className="p-3 min-w-[120px]">{col.label}</th>
                  ))}
                  {!isQualifications && <th className="p-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {list.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-500">{rowIdx + 1}</td>
                    {cols.map((col) => (
                      <td key={col.key} className="p-2">
                        {isQualifications && col.key === 'qualification' ? (
                          rowIdx === 1 ? (
                            <select
                              value={row.qualification || 'HSC'}
                              onChange={(e) => onArrayRowChange && onArrayRowChange(field_key, rowIdx, 'qualification', e.target.value, cols)}
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-slate-800 bg-amber-50/60 focus:ring-1 focus:ring-tec-navy cursor-pointer"
                            >
                              <option value="HSC">HSC</option>
                              <option value="Diploma">Diploma</option>
                            </select>
                          ) : (
                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-extrabold text-slate-800 text-xs border border-slate-200 inline-block shadow-2xs">
                              {rowIdx === 0 ? 'SSLC' : 'UG'}
                            </span>
                          )
                        ) : col.type === 'select' ? (
                          <select
                            value={row[col.key] || ''}
                            onChange={(e) => onArrayRowChange && onArrayRowChange(field_key, rowIdx, col.key, e.target.value, cols)}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-tec-navy"
                          >
                            <option value="">Select</option>
                            {(col.options || []).map((o, idx) => (
                              <option key={idx} value={typeof o === 'object' ? o.value : o}>
                                {typeof o === 'object' ? o.label : o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.key.toLowerCase().includes('year') ? 'tel' : (col.type || 'text')}
                            inputMode={col.key.toLowerCase().includes('year') ? 'numeric' : undefined}
                            maxLength={col.key.toLowerCase().includes('year') ? 4 : undefined}
                            value={row[col.key] || ''}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (col.key.toLowerCase().includes('year')) {
                                val = val.replace(/\D/g, '').slice(0, 4);
                              }
                              if (onArrayRowChange) {
                                onArrayRowChange(field_key, rowIdx, col.key, val, cols);
                              }
                            }}
                            placeholder={`Enter ${col.label}`}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-tec-navy"
                          />
                        )}
                      </td>
                    ))}
                    {!isQualifications && (
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onRemoveArrayRow && onRemoveArrayRow(field_key, rowIdx)}
                          className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          title="Remove Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ─── Special Formatted Fields: Aadhaar & Mobile ───
  if (isAadhaarField(field_key)) {
    const displayValue = formatAadhaar(value || '');
    const rawDigits = (value || '').replace(/\D/g, '');
    const isComplete = rawDigits.length === 12;

    const handleAadhaarChange = (e) => {
      const input = e.target.value;
      const digits = input.replace(/\D/g, '').slice(0, 12);
      onChange(field_key, digits);
    };

    return (
      <div className="w-full">
        {field_label && (
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {field_label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleAadhaarChange}
            placeholder={placeholder || '1234 5678 9012'}
            maxLength={14} /* 12 digits + 2 spaces */
            className={`w-full rounded-lg border text-sm transition-colors py-2.5 px-3.5 focus:outline-none focus:ring-2 tracking-widest font-mono ${error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 focus:border-tec-navy focus:ring-slate-200 bg-white'
              }`}
          />
          {isComplete && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}
        {!error && (
          <p className="mt-1 text-xs text-slate-500">
            {description || 'Enter 12-digit Aadhaar number'}
            {rawDigits.length > 0 && <span className="ml-1 font-bold text-slate-600">({rawDigits.length}/12)</span>}
          </p>
        )}
      </div>
    );
  }

  if (isMobileField(field_key)) {
    const displayValue = formatMobile(value || '');
    const rawDigits = (value || '').replace(/\D/g, '');
    const isComplete = rawDigits.length === 10;

    const handleMobileChange = (e) => {
      const input = e.target.value;
      const digits = input.replace(/\D/g, '').slice(0, 10);
      onChange(field_key, digits);
    };

    return (
      <div className="w-full">
        {field_label && (
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {field_label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type="tel"
            inputMode="numeric"
            value={displayValue}
            onChange={handleMobileChange}
            placeholder={placeholder || '98765 43210'}
            maxLength={11} /* 10 digits + 1 space */
            className={`w-full rounded-lg border text-sm transition-colors py-2.5 px-3.5 focus:outline-none focus:ring-2 tracking-widest font-mono ${error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 focus:border-tec-navy focus:ring-slate-200 bg-white'
              }`}
          />
          {isComplete && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}
        {!error && (
          <p className="mt-1 text-xs text-slate-500">
            {description || 'Enter 10-digit mobile number'}
            {rawDigits.length > 0 && <span className="ml-1 font-bold text-slate-600">({rawDigits.length}/10)</span>}
          </p>
        )}
      </div>
    );
  }

  // Date Field with realistic min/max year bounds
  if (field_type === 'date' || (field_key || '').toLowerCase().includes('date')) {
    const isDob = (field_key || '').toLowerCase().includes('birth') || (field_key || '').toLowerCase().includes('dob');
    const maxDate = isDob ? '2014-12-31' : new Date().toISOString().split('T')[0];
    return (
      <Input
        label={field_label}
        type="date"
        required={required}
        placeholder={placeholder || `Select ${field_label}`}
        value={value || ''}
        max={maxDate}
        min="1950-01-01"
        onChange={(e) => onChange(field_key, e.target.value)}
        error={error}
        helperText={description || (isDob ? 'Select a valid Date of Birth' : '')}
      />
    );
  }

  // Standard Text / Email / Number Field
  return (
    <Input
      label={field_label}
      type={field_type}
      required={required}
      placeholder={placeholder || `Enter ${field_label}`}
      value={value || ''}
      onChange={(e) => onChange(field_key, e.target.value)}
      error={error}
      helperText={description}
    />
  );
}

/**
 * Academic Performance Marks Component matching official paper layout:
 * - HSC Mode: Stream choice between (i) HSC Academic Stream and (ii) HSC Vocational Stream
 * - Semester Mode: Default 6 Semesters required (Sem I - VI) plus 2 optional semesters (Sem VII - VIII)
 */
function AcademicPerformanceRenderer({ field_label, required, value, onChange, error, programLevel, formValues }) {
  const isPg = String(programLevel || '').toUpperCase() === 'PG';
  const qualList = formValues?.qualifications || formValues?.academic_qualification || [];
  const selectedQualRow = qualList[1]?.qualification || (isPg ? 'UG' : 'HSC');
  const isDiploma = selectedQualRow === 'Diploma';
  const isUgDegree = selectedQualRow === 'UG' || qualList[2]?.qualification === 'UG';
  const isSemesterMode = isPg || isDiploma || isUgDegree;

  // Stream state for HSC: 'academic' or 'vocational'
  const [stream, setStream] = React.useState('academic');

  // HSC Academic default subjects
  const hscAcademicSubjects = React.useMemo(() => ['Maths (M)', 'Physics (P)', 'Chemistry (C)'], []);
  // HSC Vocational default subjects
  const hscVocationalSubjects = React.useMemo(() => ['Maths (M)', 'Theory (I)', 'Practical 1&2'], []);

  // Semester default labels (Semesters I to VIII)
  const semesterLabels = React.useMemo(() => [
    'Semester I', 'Semester II', 'Semester III',
    'Semester IV', 'Semester V', 'Semester VI',
    'Semester VII', 'Semester VIII'
  ], []);

  // Ensure active list is properly initialized in state for HSC
  React.useEffect(() => {
    if (!isSemesterMode) {
      const currentList = Array.isArray(value) ? value : [];
      const targetSubjects = stream === 'academic' ? hscAcademicSubjects : hscVocationalSubjects;

      // Check if currentList matches active targetSubjects
      const isMatching = currentList.length === 3 && targetSubjects.every((subj) => currentList.some((r) => r.subject === subj));

      if (!isMatching) {
        const newList = targetSubjects.map((subj) => {
          const existing = currentList.find((r) => r.subject === subj);
          return {
            qualification: 'HSC',
            stream: stream === 'academic' ? 'HSC Academic' : 'HSC Vocational',
            subject: subj,
            maximum_marks: existing?.maximum_marks || '100',
            obtained_marks: existing?.obtained_marks || '',
            percentage: existing?.percentage || '0.00'
          };
        });
        onChange('academic_performance', newList);
      }
    }
  }, [isSemesterMode, stream, hscAcademicSubjects, hscVocationalSubjects, value, onChange]);

  // Stream Switch Handler
  const handleStreamChange = (newStream) => {
    setStream(newStream);
    const targetSubjects = newStream === 'academic' ? hscAcademicSubjects : hscVocationalSubjects;
    const currentList = Array.isArray(value) ? value : [];

    const newList = targetSubjects.map((subj) => {
      const existing = currentList.find((r) => r.subject === subj);
      return {
        qualification: 'HSC',
        stream: newStream === 'academic' ? 'HSC Academic' : 'HSC Vocational',
        subject: subj,
        maximum_marks: existing?.maximum_marks || '100',
        obtained_marks: existing?.obtained_marks || '',
        percentage: existing?.percentage || '0.00'
      };
    });
    onChange('academic_performance', newList);
  };

  // Calculate Cutoff out of 200 for HSC
  const calculateHscCutoff = (list) => {
    let mathsPct = 0;
    let sub2Pct = 0;
    let sub3Pct = 0;

    list.forEach((r) => {
      const max = parseFloat(r.maximum_marks) || 0;
      const obt = parseFloat(r.obtained_marks) || 0;
      const pct = max > 0 ? (obt / max) * 100 : 0;
      const s = (r.subject || '').toLowerCase();
      if (s.includes('maths')) mathsPct = pct;
      else if (s.includes('physics') || s.includes('theory')) sub2Pct = pct;
      else if (s.includes('chemistry') || s.includes('practical')) sub3Pct = pct;
    });

    const cutoff = mathsPct + ((sub2Pct + sub3Pct) / 2);
    return cutoff > 0 ? cutoff.toFixed(2) : '0.00';
  };

  // Calculate Semester Totals
  const calculateSemesterTotal = (list) => {
    let totalMax = 0;
    let totalObt = 0;
    list.forEach((r) => {
      const max = parseFloat(r.maximum_marks) || 0;
      const obt = parseFloat(r.obtained_marks) || 0;
      if (max > 0) {
        totalMax += max;
        totalObt += obt;
      }
    });
    const overallPct = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : '0.00';
    return { totalMax, totalObt, overallPct };
  };

  // Handle HSC Row Change
  const handleHscRowChange = (subject, fieldName, val) => {
    const list = Array.isArray(value) ? [...value] : [];
    let rowIdx = list.findIndex((r) => r.subject === subject);
    if (rowIdx === -1) {
      list.push({ qualification: 'HSC', subject, maximum_marks: '100', obtained_marks: '', percentage: '0.00' });
      rowIdx = list.length - 1;
    }

    const updatedRow = { ...list[rowIdx], qualification: 'HSC', subject, [fieldName]: val };
    const max = parseFloat(fieldName === 'maximum_marks' ? val : updatedRow.maximum_marks) || 0;
    const obt = parseFloat(fieldName === 'obtained_marks' ? val : updatedRow.obtained_marks) || 0;
    if (max > 0 && !isNaN(obt)) {
      updatedRow.percentage = ((obt / max) * 100).toFixed(2);
    } else {
      updatedRow.percentage = '0.00';
    }

    list[rowIdx] = updatedRow;
    onChange('academic_performance', list);
  };

  // Handle Semester Row Change
  const handleSemRowChange = (semLabel, fieldName, val) => {
    const qual = isPg ? 'UG' : 'Diploma';
    const list = Array.isArray(value) ? [...value] : [];
    let rowIdx = list.findIndex((r) => r.semester === semLabel || r.subject === semLabel);
    if (rowIdx === -1) {
      list.push({ qualification: qual, semester: semLabel, subject: semLabel, maximum_marks: '1000', obtained_marks: '', percentage: '0.00' });
      rowIdx = list.length - 1;
    }

    const updatedRow = { ...list[rowIdx], qualification: qual, semester: semLabel, subject: semLabel, [fieldName]: val };
    const max = parseFloat(fieldName === 'maximum_marks' ? val : updatedRow.maximum_marks) || 0;
    const obt = parseFloat(fieldName === 'obtained_marks' ? val : updatedRow.obtained_marks) || 0;
    if (max > 0 && !isNaN(obt)) {
      updatedRow.percentage = ((obt / max) * 100).toFixed(2);
    } else {
      updatedRow.percentage = '0.00';
    }

    list[rowIdx] = updatedRow;
    onChange('academic_performance', list);
  };

  const list = Array.isArray(value) ? value : [];

  return (
    <div className="w-full space-y-4 col-span-full border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Marks obtained in the Qualification Examination
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {isSemesterMode
              ? `Semester Marks Table (${isPg ? 'Undergraduate Degree' : 'Diploma Course'}) - Default 6 Semesters required`
              : 'Enter HSC Subject Marks (Academic Stream or Vocational Stream)'}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-tec-navy/10 text-tec-navy text-xs font-extrabold border border-tec-navy/20">
          {isSemesterMode ? (isPg ? 'UG Semesters' : 'Diploma Semesters') : 'HSC Marks'}
        </span>
      </div>

      {/* MODE 1: HSC Subject Marks Input (Academic vs Vocational Stream) */}
      {!isSemesterMode && (
        <div className="space-y-4">
          {/* Stream Selector Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleStreamChange('academic')}
              className={`p-3 rounded-lg text-xs font-extrabold text-left transition flex items-center justify-between cursor-pointer ${stream === 'academic'
                  ? 'bg-tec-navy text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              <span>(i) HSC (Academic Stream) / Equivalent</span>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${stream === 'academic' ? 'border-white bg-tec-gold' : 'border-slate-400'}`} />
            </button>

            <button
              type="button"
              onClick={() => handleStreamChange('vocational')}
              className={`p-3 rounded-lg text-xs font-extrabold text-left transition flex items-center justify-between cursor-pointer ${stream === 'vocational'
                  ? 'bg-tec-navy text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              <span>(ii) HSC (Vocational) / Equivalent</span>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${stream === 'vocational' ? 'border-white bg-tec-gold' : 'border-slate-400'}`} />
            </button>
          </div>

          {/* Academic Stream Table */}
          {stream === 'academic' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                    <tr>
                      <th className="p-3 w-1/3">(i) HSC (Academic Stream) Subjects</th>
                      <th className="p-3 min-w-[120px]">Maximum Marks</th>
                      <th className="p-3 min-w-[120px]">Maximum Obtained</th>
                      <th className="p-3 min-w-[120px]">Percentage of Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {hscAcademicSubjects.map((subject) => {
                      const row = list.find((r) => r.subject === subject) || {};
                      return (
                        <tr key={subject} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-extrabold text-slate-800">{subject}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={row.maximum_marks ?? '100'}
                              onChange={(e) => handleHscRowChange(subject, 'maximum_marks', e.target.value)}
                              placeholder="100"
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-tec-navy"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={row.obtained_marks ?? ''}
                              onChange={(e) => handleHscRowChange(subject, 'obtained_marks', e.target.value)}
                              placeholder="e.g. 95"
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-tec-navy bg-amber-50/40"
                            />
                          </td>
                          <td className="p-3 font-extrabold text-tec-navy">
                            {row.percentage ? `${row.percentage}%` : '0.00%'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Subtotal Cutoff Box */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-600 block">Marks out of 200</span>
                  <span className="text-[11px] text-slate-500 italic">% of (M) + % of put together (P)+(C)</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-tec-navy">{calculateHscCutoff(list)} / 200</span>
                </div>
              </div>
            </div>
          )}

          {/* Vocational Stream Table */}
          {stream === 'vocational' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                    <tr>
                      <th className="p-3 w-1/3">(ii) HSC (Vocational) Subjects</th>
                      <th className="p-3 min-w-[120px]">Maximum Marks</th>
                      <th className="p-3 min-w-[120px]">Maximum Obtained</th>
                      <th className="p-3 min-w-[120px]">Percentage of Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {hscVocationalSubjects.map((subject) => {
                      const row = list.find((r) => r.subject === subject) || {};
                      return (
                        <tr key={subject} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-extrabold text-slate-800">{subject}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={row.maximum_marks ?? '100'}
                              onChange={(e) => handleHscRowChange(subject, 'maximum_marks', e.target.value)}
                              placeholder="100"
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-tec-navy"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={row.obtained_marks ?? ''}
                              onChange={(e) => handleHscRowChange(subject, 'obtained_marks', e.target.value)}
                              placeholder="e.g. 90"
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-tec-navy bg-amber-50/40"
                            />
                          </td>
                          <td className="p-3 font-extrabold text-tec-navy">
                            {row.percentage ? `${row.percentage}%` : '0.00%'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Subtotal Cutoff Box */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-600 block">Marks out of 200</span>
                  <span className="text-[11px] text-slate-500 italic">% of (M) + % of put together (I)+(II)</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-tec-navy">{calculateHscCutoff(list)} / 200</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Semester Marks Table (Diploma / UG Degree) */}
      {isSemesterMode && (
        <div className="space-y-3">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                <tr>
                  <th className="p-3 min-w-[120px]">Semester</th>
                  <th className="p-3 min-w-[120px]">Maximum Marks</th>
                  <th className="p-3 min-w-[120px]">Maximum Obtained</th>
                  <th className="p-3 min-w-[120px]">Percentage of Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {semesterLabels.map((semLabel, idx) => {
                  const isCompulsorySem = idx < 6; // Semesters I to VI required
                  const row = list.find((r) => r.semester === semLabel || r.subject === semLabel) || {};
                  return (
                    <tr key={semLabel} className={isCompulsorySem ? 'hover:bg-slate-50 transition' : 'bg-slate-50/60 hover:bg-slate-100/60 transition'}>
                      <td className="p-3 font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span>{semLabel}</span>
                        {isCompulsorySem ? (
                          <span className="text-[10px] font-bold text-rose-500">*</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">(Optional)</span>
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.maximum_marks ?? '1000'}
                          onChange={(e) => handleSemRowChange(semLabel, 'maximum_marks', e.target.value)}
                          placeholder="1000"
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-tec-navy"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.obtained_marks ?? ''}
                          onChange={(e) => handleSemRowChange(semLabel, 'obtained_marks', e.target.value)}
                          placeholder={isCompulsorySem ? 'Obtained Marks' : 'Optional Marks'}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-tec-navy bg-amber-50/40"
                        />
                      </td>
                      <td className="p-3 font-extrabold text-tec-navy">
                        {row.percentage ? `${row.percentage}%` : '0.00%'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Total Cumulative Summary Row */}
              <tfoot className="bg-slate-800 text-white font-extrabold text-xs">
                {(() => {
                  const totals = calculateSemesterTotal(list);
                  return (
                    <tr>
                      <td className="p-3">TOTAL</td>
                      <td className="p-3">{totals.totalMax || '-'}</td>
                      <td className="p-3">{totals.totalObt || '-'}</td>
                      <td className="p-3 text-tec-gold text-sm font-black">{totals.overallPct}%</td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Certificates Renderer matching official document types & compulsory vs optional rules:
 * - Default 5 compulsory certificate rows for UG (Photo, Aadhaar, SSLC, HSC, TC)
 * - Default 6 compulsory certificate rows for PG / Diploma (Photo, Aadhaar, SSLC, HSC, TC, Degree/Diploma Certificate)
 * - Extra added rows via '+ Add Row' are optional.
 */
function CertificatesRenderer({ field_label, required, value, onChange, error, programLevel, formValues, uploadProgress }) {
  const isPg = String(programLevel || '').toUpperCase() === 'PG';
  const qualList = formValues?.qualifications || formValues?.academic_qualification || [];
  const selectedQualRow = qualList[1]?.qualification || (isPg ? 'UG' : 'HSC');
  const isDiploma = selectedQualRow === 'Diploma';
  const isUgDegree = selectedQualRow === 'UG' || qualList[2]?.qualification === 'UG';
  const isPgOrDiploma = isPg || isDiploma || isUgDegree;

  // Build list of default compulsory certificate types
  const defaultCertTypes = React.useMemo(() => {
    const list = [
      'Passport Size Photo',
      'Aadhaar Card',
      'SSLC Marksheet',
      'HSC Marksheet',
      'Transfer Certificate'
    ];
    if (isPg || isUgDegree) {
      list.push('Degree Certificate');
    } else if (isDiploma) {
      list.push('Diploma Certificate');
    }
    return list;
  }, [isPg, isDiploma, isUgDegree]);

  // Dynamic list of certificate options tailored strictly to candidate level (UG vs PG vs Diploma)
  const allCertOptions = React.useMemo(() => {
    const baseOptions = [
      'Passport Size Photo',
      'Aadhaar Card',
      'SSLC Marksheet',
      'HSC Marksheet',
      'Transfer Certificate',
      'Conduct Certificate',
      'Community Certificate',
      'Income Certificate',
      'Nativity Certificate',
      'First Graduate Certificate',
      'Anna University Allotment Order'
    ];

    if (isPg || isUgDegree) {
      // PG / UG Degree options
      baseOptions.push(
        'Migration Certificate',
        'Degree Certificate',
        'Consolidated Marksheet',
        'Provisional Certificate'
      );
    } else if (isDiploma) {
      // Diploma options
      baseOptions.push(
        'Migration Certificate',
        'Diploma Certificate',
        'Consolidated Marksheet',
        'Provisional Certificate'
      );
    }
    return baseOptions;
  }, [isPg, isDiploma, isUgDegree]);

  // Auto-initialize and enforce unique default compulsory certificate types for rows 0..compulsoryCount-1
  React.useEffect(() => {
    const currentList = Array.isArray(value) ? value : [];

    // Check if current list has distinct default certificate types
    let needsReset = currentList.length === 0;
    if (currentList.length >= 2 && currentList[0]?.certificate_type === currentList[1]?.certificate_type) {
      needsReset = true;
    }

    if (needsReset) {
      const initialList = defaultCertTypes.map((certType, idx) => ({
        certificate_type: certType,
        document: currentList[idx]?.document || ''
      }));
      // Retain extra rows if any
      if (currentList.length > defaultCertTypes.length) {
        for (let i = defaultCertTypes.length; i < currentList.length; i++) {
          initialList.push(currentList[i]);
        }
      }
      onChange('certificates', initialList);
    } else {
      // Check if any compulsory row is missing its specific certificate_type
      let needsSync = false;
      const synced = [...currentList];
      defaultCertTypes.forEach((certType, idx) => {
        if (!synced[idx]) {
          synced[idx] = { certificate_type: certType, document: '' };
          needsSync = true;
        } else if (!synced[idx].certificate_type) {
          synced[idx].certificate_type = certType;
          needsSync = true;
        }
      });
      if (needsSync) {
        onChange('certificates', synced);
      }
    }
  }, [defaultCertTypes, value, onChange]);

  const list = Array.isArray(value) ? value : [];
  const compulsoryCount = defaultCertTypes.length;

  // Selected certificate types across all rows (for dynamic filtering)
  const selectedCertTypes = list.map((r) => r.certificate_type).filter(Boolean);

  const handleRowCertChange = (rowIdx, certType) => {
    const updated = [...list];
    updated[rowIdx] = { ...updated[rowIdx], certificate_type: certType };
    onChange('certificates', updated);
  };

  const handleRowFileChange = (rowIdx, fileOrUrl) => {
    const updated = [...list];
    updated[rowIdx] = { ...updated[rowIdx], document: fileOrUrl };
    onChange('certificates', updated);
  };

  const handleAddExtraRow = () => {
    const firstAvailable = allCertOptions.find((opt) => !selectedCertTypes.includes(opt)) || 'Other';
    const updated = [...list, { certificate_type: firstAvailable, document: '' }];
    onChange('certificates', updated);
  };

  const handleRemoveExtraRow = (rowIdx) => {
    const updated = list.filter((_, idx) => idx !== rowIdx);
    onChange('certificates', updated);
  };

  return (
    <div className="w-full space-y-4 col-span-full border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-extrabold text-slate-900">
          {field_label || 'Upload Certificates'} {required && <span className="text-rose-500">*</span>}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {compulsoryCount} Compulsory Certificates ({isPgOrDiploma ? 'PG / Diploma' : 'UG / HSC'}) + Optional Additional Documents
        </p>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
            <tr>
              <th className="p-3 w-12">#</th>
              <th className="p-3 min-w-[220px]">Certificate Type</th>
              <th className="p-3 min-w-[280px]">Upload File</th>
              <th className="p-3 text-right w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {list.map((row, rowIdx) => {
              const isCompulsory = rowIdx < compulsoryCount;
              // Filter available options: include current row's selection, exclude options chosen in other rows
              const availableOptions = allCertOptions.filter(
                (opt) => opt === row.certificate_type || !selectedCertTypes.includes(opt)
              );

              return (
                <tr key={rowIdx} className={isCompulsory ? 'hover:bg-slate-50 transition' : 'bg-slate-50/50 hover:bg-slate-100/60 transition'}>
                  <td className="p-3 font-bold text-slate-500">{rowIdx + 1}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={row.certificate_type || availableOptions[0] || ''}
                        onChange={(e) => handleRowCertChange(rowIdx, e.target.value)}
                        className={`w-full rounded-lg border p-2 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-tec-navy cursor-pointer ${isCompulsory ? 'bg-slate-50 border-slate-300' : 'bg-amber-50/50 border-amber-200'
                          }`}
                      >
                        {availableOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {isCompulsory && (
                        <span className="text-[10px] font-extrabold text-rose-500 shrink-0" title="Compulsory Upload">* Required</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <FileUpload
                      label=""
                      required={isCompulsory}
                      value={row.document || ''}
                      onChange={(fileVal) => handleRowFileChange(rowIdx, fileVal)}
                      uploadProgress={uploadProgress}
                    />
                  </td>
                  <td className="p-3 text-right">
                    {!isCompulsory ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraRow(rowIdx)}
                        className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="Remove Optional Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic">Default</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Add Row UX */}
      <div className="pt-2 flex items-center justify-end">
        <button
          type="button"
          onClick={handleAddExtraRow}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-tec-navy hover:bg-tec-navy-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Row</span>
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
