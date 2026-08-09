import React from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { FileUpload } from '../common/FileUpload';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Normalize options from various backend formats into { value, label } objects.
 * Handles: array of strings, array of objects, comma-separated string, single string, etc.
 */
function normalizeOptions(rawOptions, fieldKey) {
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

  // Fallback: provide hardcoded options for well-known field keys
  const key = (fieldKey || '').toLowerCase();
  if (key.includes('gender') || key === 'sex') {
    return [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Transgender', label: 'Transgender' },
    ];
  }
  if (key.includes('community') || key.includes('caste_category')) {
    return [
      { value: 'OC', label: 'OC (General)' },
      { value: 'BC', label: 'BC' },
      { value: 'BCM', label: 'BCM' },
      { value: 'MBC', label: 'MBC' },
      { value: 'DNC', label: 'DNC' },
      { value: 'SC', label: 'SC' },
      { value: 'SCA', label: 'SCA' },
      { value: 'ST', label: 'ST' },
    ];
  }
  if (key.includes('blood_group') || key === 'blood_type') {
    return [
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' },
    ];
  }
  if (key.includes('religion')) {
    return [
      { value: 'Hindu', label: 'Hindu' },
      { value: 'Muslim', label: 'Muslim' },
      { value: 'Christian', label: 'Christian' },
      { value: 'Sikh', label: 'Sikh' },
      { value: 'Buddhist', label: 'Buddhist' },
      { value: 'Jain', label: 'Jain' },
      { value: 'Other', label: 'Other' },
    ];
  }
  if (key.includes('nationality')) {
    return [
      { value: 'Indian', label: 'Indian' },
      { value: 'NRI', label: 'NRI' },
      { value: 'Other', label: 'Other' },
    ];
  }
  if (key.includes('mother_tongue') || key === 'language') {
    return [
      { value: 'Tamil', label: 'Tamil' },
      { value: 'English', label: 'English' },
      { value: 'Hindi', label: 'Hindi' },
      { value: 'Telugu', label: 'Telugu' },
      { value: 'Malayalam', label: 'Malayalam' },
      { value: 'Kannada', label: 'Kannada' },
      { value: 'Urdu', label: 'Urdu' },
      { value: 'Other', label: 'Other' },
    ];
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
 * Detect if a field key relates to aadhaar
 */
function isAadhaarField(key) {
  const k = (key || '').toLowerCase();
  return k.includes('aadhaar') || k.includes('aadhar') || k.includes('aadar') || k.includes('uid_number');
}

/**
 * Detect if a field key relates to mobile/phone number
 */
function isMobileField(key) {
  const k = (key || '').toLowerCase();
  return k.includes('mobile') || k.includes('phone') || k.includes('contact_number') || k.includes('whatsapp');
}

export function DynamicFormField({
  field,
  value,
  onChange,
  error,
  uploadProgress,
  onAddArrayRow,
  onRemoveArrayRow,
  onArrayRowChange
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
      <div className="space-y-1">
        <FileUpload
          label={field_label}
          required={required}
          value={fileVal}
          onChange={(fileObj) => onChange(field_key, fileObj)}
          error={error}
          description={description || 'Upload PDF, JPG, or PNG document'}
        />
        {uploadProgress !== undefined && uploadProgress !== null && (
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Render Select / Dropdown Field
  if (field_type === 'select') {
    // Use robust option normalization (handles empty arrays, strings, objects, etc.)
    const formattedOptions = normalizeOptions(options, field_key);

    // Also check field.choices as an alternate source of options
    const finalOptions = formattedOptions.length > 0
      ? formattedOptions
      : normalizeOptions(field.choices, field_key);

    return (
      <Select
        label={field_label}
        required={required}
        options={finalOptions}
        placeholder={placeholder || `Select ${field_label}`}
        value={value || ''}
        onChange={(e) => onChange(field_key, e.target.value)}
        error={error}
        helperText={description}
      />
    );
  }

  // Render Textarea Field
  if (field_type === 'textarea') {
    return (
      <div className="w-full">
        {field_label && (
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {field_label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(field_key, e.target.value)}
          placeholder={placeholder || `Enter ${field_label}`}
          className={`w-full rounded-lg border text-sm transition-colors py-2.5 px-3.5 focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-300 focus:border-tec-navy focus:ring-slate-200 bg-white'
          }`}
        />
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
            <span>⚠️</span> {error}
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
      <div className="w-full pt-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(field_key, e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-tec-navy focus:ring-tec-navy cursor-pointer"
          />
          <span className="text-sm text-slate-800 font-medium leading-tight">
            {field_label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1 ml-7">
            <span>⚠️</span> {error}
          </p>
        )}
        {!error && description && (
          <p className="mt-1 text-xs text-slate-500 ml-7">{description}</p>
        )}
      </div>
    );
  }

  // Render Array / Repeater Table Field (e.g., marks, qualifications)
  if (field_type === 'array') {
    const list = Array.isArray(value) ? value : [];
    const cols = (field.choices && field.choices.length > 0) ? field.choices : (columns && columns.length > 0 ? columns : [
      { key: 'qualification', label: 'Qualification', type: 'select', options: ['SSLC', 'HSC', 'Diploma', 'UG'] },
      { key: 'institution', label: 'School / College', type: 'text' },
      { key: 'board', label: 'Board / University', type: 'text' },
      { key: 'register_number', label: 'Register Number', type: 'text' },
      { key: 'year_of_passing', label: 'Year', type: 'number' },
      { key: 'percentage', label: 'Percentage (%)', type: 'number' }
    ]);

    return (
      <div className="w-full space-y-3 col-span-full">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-800">
            {field_label} {required && <span className="text-rose-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => onAddArrayRow && onAddArrayRow(field_key, cols)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tec-navy hover:bg-tec-navy-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        {list.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center text-xs text-slate-500">
            No items added yet. Click &quot;Add Row&quot; above to enter {field_label.toLowerCase()}.
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
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {list.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-500">{rowIdx + 1}</td>
                    {cols.map((col) => (
                      <td key={col.key} className="p-2">
                        {col.type === 'select' ? (
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
                            type={col.type || 'text'}
                            value={row[col.key] || ''}
                            onChange={(e) => onArrayRowChange && onArrayRowChange(field_key, rowIdx, col.key, e.target.value, cols)}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-tec-navy"
                          />
                        )}
                      </td>
                    ))}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
            <span>⚠️</span> {error}
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
            className={`w-full rounded-lg border text-sm transition-colors py-2.5 px-3.5 focus:outline-none focus:ring-2 tracking-widest font-mono ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 focus:border-tec-navy focus:ring-slate-200 bg-white'
            }`}
          />
          {isComplete && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <span className="text-emerald-500 text-sm">✓</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
            <span>⚠️</span> {error}
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
            className={`w-full rounded-lg border text-sm transition-colors py-2.5 px-3.5 focus:outline-none focus:ring-2 tracking-widest font-mono ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 focus:border-tec-navy focus:ring-slate-200 bg-white'
            }`}
          />
          {isComplete && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <span className="text-emerald-500 text-sm">✓</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
            <span>⚠️</span> {error}
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

  // Standard Text / Email / Number / Date Field
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
