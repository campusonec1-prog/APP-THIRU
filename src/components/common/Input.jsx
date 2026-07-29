import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  required = false,
  helperText,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full rounded-lg border text-sm transition-colors py-2.5 px-3.5 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-300 focus:border-tec-navy focus:ring-slate-200 bg-white'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
          <span>⚠️</span> {error.message || error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
