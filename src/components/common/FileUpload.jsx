import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, Image as ImageIcon } from 'lucide-react';

export function FileUpload({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 2,
  value,
  onChange,
  error,
  required = false,
  description = 'PDF, JPG, or PNG (Max 2MB)'
}) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);

  const processFile = (file) => {
    setFileError('');
    if (!file) return;

    // Check size limit (maxSizeMB in MB)
    if (file.size > maxSizeMB * 1024 * 1024) {
      const err = `File size exceeds ${maxSizeMB}MB limit.`;
      setFileError(err);
      return;
    }

    // Check file extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      const err = 'Invalid file type. Please upload PDF, JPG, or PNG.';
      setFileError(err);
      return;
    }

    // Create preview data object
    const fileObj = {
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      uploadedAt: new Date().toLocaleDateString(),
    };

    if (onChange) onChange(fileObj);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onChange) onChange(null);
    if (inputRef.current) inputRef.current.value = '';
    setFileError('');
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {value ? (
        <div className="relative border border-emerald-200 bg-emerald-50/40 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {value.previewUrl ? (
              <img
                src={value.previewUrl}
                alt="Preview"
                className="w-12 h-12 rounded object-cover border border-emerald-300"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                PDF
              </div>
            )}
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {value.name}
              </p>
              <p className="text-xs text-slate-500">{value.size || 'Uploaded document'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-full hover:bg-emerald-200/50 text-slate-500 hover:text-rose-600 transition"
            title="Remove document"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
            dragActive
              ? 'border-tec-navy bg-slate-100'
              : (error || fileError)
              ? 'border-rose-300 bg-rose-50/20'
              : 'border-slate-300 hover:border-tec-navy hover:bg-slate-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <UploadCloud className="w-8 h-8 mx-auto mb-2 text-tec-navy" />
          <p className="text-sm font-medium text-slate-700">
            Click to upload or drag & drop file
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      )}

      {(error || fileError) && (
        <p className="mt-1 text-xs text-rose-600 font-medium">
          {fileError || (typeof error === 'string' ? error : error?.message)}
        </p>
      )}
    </div>
  );
}
