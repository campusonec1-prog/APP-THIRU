import React from 'react';
import { DynamicFormField } from './DynamicFormField';

export function DynamicFormModule({
  module,
  fields = [],
  formValues = {},
  errors = {},
  uploadProgressMap = {},
  onChange,
  onAddArrayRow,
  onRemoveArrayRow,
  onArrayRowChange,
  programLevel = 'UG'
}) {
  if (!module) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Module Title & Description */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {module.module_name || module.name || 'Form Section'}
          </h2>
          {module.is_required !== false && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
              Required Module
            </span>
          )}
        </div>
        {module.description && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {module.description}
          </p>
        )}
      </div>

      {/* Fields Grid */}
      {fields.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-4 text-center">
          No configurable fields found for this module.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {fields.map((field) => {
            const isFullWidth = field.field_type === 'array' || field.field_type === 'file' || field.field_type === 'textarea';
            return (
              <div
                key={field.id || field.field_key}
                className={isFullWidth ? 'sm:col-span-2' : 'col-span-1'}
              >
                <DynamicFormField
                  field={field}
                  value={formValues[field.field_key]}
                  onChange={onChange}
                  error={errors[field.field_key]}
                  uploadProgress={uploadProgressMap[field.field_key]}
                  onAddArrayRow={onAddArrayRow}
                  onRemoveArrayRow={onRemoveArrayRow}
                  onArrayRowChange={onArrayRowChange}
                  programLevel={programLevel}
                  formValues={formValues}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
