import React from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { FileUpload } from '../common/FileUpload';
import { Plus, Trash2 } from 'lucide-react';

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
    const formattedOptions = Array.isArray(options)
      ? options.map((opt) => (typeof opt === 'object' ? opt : { value: opt, label: opt }))
      : [];

    return (
      <Select
        label={field_label}
        required={required}
        options={formattedOptions}
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
