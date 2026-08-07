import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getFormModulesList,
  getFormFieldsList,
  getDepartmentsList,
  submitApplication,
  uploadDocument
} from '../services/api';
import { useAuth } from '../Context/AuthContext';
import { COLLEGE_CONFIG } from '../Config/collegeConfig';
import { realtimeManager } from '../services/websocket';
import {
  FileText, ArrowRight, ArrowLeft, CheckCircle2,
  Plus, Trash2, Upload, ShieldCheck, Save, BookmarkCheck, RotateCcw
} from 'lucide-react';

export function Apply() {
  const { user, showToast, academicYear } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL query pre-selections (e.g. /apply?degree=UG&dept=...)
  const initialDegree = searchParams.get('degree') || 'UG';
  const initialDept = searchParams.get('dept') || '';

  // API State
  const [modules, setModules] = useState([]);
  const [fields, setFields] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Navigation & Values State
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [formValues, setFormValues] = useState({
    program: initialDegree,
    department: initialDept,
    qualifications: [],
    academic_performance: [],
    certificates: [],
    declaration: false,
  });
  const [errors, setErrors] = useState({});
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const rawDraft = localStorage.getItem('tec_application_draft');
    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft);
        if (parsed && parsed.formValues) {
          setFormValues((prev) => ({ ...prev, ...parsed.formValues }));
          if (parsed.currentModuleIndex !== undefined) {
            setCurrentModuleIndex(parsed.currentModuleIndex);
          }
          if (parsed.savedAt) {
            setDraftSavedAt(parsed.savedAt);
          }
          showToast(`Restored saved application draft (${parsed.savedAt || 'previous session'})`, 'info');
        }
      } catch (e) {
        console.error('Failed to parse saved draft:', e);
      }
    }
  }, []);

  // Fetch Form Schema from API
  const fetchFormSchema = useCallback(async () => {
    try {
      setLoading(true);
      const [modulesData, fieldsData, deptsData] = await Promise.all([
        getFormModulesList().catch(() => []),
        getFormFieldsList().catch(() => []),
        getDepartmentsList().catch(() => []),
      ]);

      const rawModules = Array.isArray(modulesData) ? modulesData : (modulesData?.data || []);
      const rawFields = Array.isArray(fieldsData) ? fieldsData : (fieldsData?.data || []);
      const rawDepts = Array.isArray(deptsData) ? deptsData : (deptsData?.data || []);

      const sortedModules = rawModules
        .filter((m) => m.is_active !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      setModules(sortedModules);
      setFields(rawFields.filter((f) => f.is_active !== false));
      setDepartments(rawDepts);

      // Initialize default arrays for dynamic fields
      setFormValues((prev) => {
        const next = { ...prev };
        rawFields.forEach((f) => {
          if (f.field_type === 'array' && !next[f.field_key]) {
            next[f.field_key] = [];
          }
        });
        return next;
      });
    } catch (err) {
      console.error('Failed to load form schema:', err);
      showToast('Failed to load application form fields.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFormSchema();
  }, [fetchFormSchema]);

  // Live WebSocket subscription for dynamic backend schema edits
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe((payload) => {
      console.log('[Apply] Real-time schema update received:', payload);
      fetchFormSchema();
    });
    return unsubscribe;
  }, [fetchFormSchema]);

  // Active Module & Fields memoization
  const currentModule = modules[currentModuleIndex] || null;
  const currentModuleFields = useMemo(() => {
    if (!currentModule) return [];
    return fields
      .filter((f) => f.form_module_id === currentModule.id)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [currentModule, fields]);

  // Dynamic Completion Percentage Memoization
  const completionPercentage = useMemo(() => {
    if (!fields.length) return 0;
    let requiredCount = 0;
    let filledCount = 0;

    fields.forEach((f) => {
      if (f.required) {
        requiredCount += 1;
        const val = formValues[f.field_key];
        if (f.field_type === 'array') {
          if (Array.isArray(val) && val.length > 0) filledCount += 1;
        } else if (f.field_type === 'checkbox') {
          if (Boolean(val)) filledCount += 1;
        } else if (val !== undefined && val !== null && val !== '') {
          filledCount += 1;
        }
      }
    });

    return requiredCount > 0 ? Math.round((filledCount / requiredCount) * 100) : 0;
  }, [fields, formValues]);

  // Save Draft to localStorage
  const handleSaveDraft = () => {
    try {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const draftPayload = {
        formValues,
        currentModuleIndex,
        savedAt: timeStr,
      };
      localStorage.setItem('tec_application_draft', JSON.stringify(draftPayload));
      setDraftSavedAt(timeStr);
      showToast(`Application draft saved at ${timeStr}`, 'success');
    } catch (e) {
      showToast('Failed to save application draft.', 'error');
    }
  };

  // Reset Form – clears localStorage draft and resets all values to defaults
  const handleResetForm = () => {
    if (!window.confirm('Reset the entire form? This will clear all entered data and the saved draft.')) return;
    localStorage.removeItem('tec_application_draft');
    setFormValues({
      program: initialDegree,
      department: initialDept,
      qualifications: [],
      academic_performance: [],
      certificates: [],
      declaration: false,
    });
    setCurrentModuleIndex(0);
    setErrors({});
    setDraftSavedAt(null);
    showToast('Form has been reset. All data cleared.', 'info');
  };

  // Handle Simple Input Change
  const handleInputChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  // Handle Array Row Operations
  const handleAddArrayRow = (fieldKey, columns) => {
    const newRow = {};
    columns.forEach((col) => {
      newRow[col.key] = col.type === 'number' ? '' : col.type === 'select' && col.options?.length ? col.options[0] : '';
    });
    setFormValues((prev) => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), newRow],
    }));
  };

  const handleRemoveArrayRow = (fieldKey, rowIndex) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldKey]: (prev[fieldKey] || []).filter((_, idx) => idx !== rowIndex),
    }));
  };

  const handleArrayRowChange = (fieldKey, rowIndex, colKey, value, columns) => {
    setFormValues((prev) => {
      const list = [...(prev[fieldKey] || [])];
      const updatedRow = { ...list[rowIndex], [colKey]: value };

      // Auto-calculate percentage if max & obtained marks are provided
      if (colKey === 'maximum_marks' || colKey === 'obtained_marks') {
        const max = parseFloat(colKey === 'maximum_marks' ? value : updatedRow.maximum_marks);
        const obt = parseFloat(colKey === 'obtained_marks' ? value : updatedRow.obtained_marks);
        if (max > 0 && !isNaN(obt)) {
          updatedRow.percentage = ((obt / max) * 100).toFixed(2);
        }
      }

      list[rowIndex] = updatedRow;
      return { ...prev, [fieldKey]: list };
    });
  };

  // Handle File Upload
  const handleFileUpload = async (key, file) => {
    if (!file) return;
    try {
      showToast(`Uploading ${file.name}...`, 'info');
      const res = await uploadDocument(file, key);
      const fileUrl = res.data && res.data[0] ? res.data[0].file_url : file.name;
      setFormValues((prev) => ({
        ...prev,
        [key]: fileUrl,
      }));
      showToast(`Uploaded ${file.name} successfully`, 'success');
    } catch (err) {
      showToast(`Failed to upload ${file.name}`, 'error');
    }
  };

  // Validate Current Module Fields
  const validateCurrentModule = () => {
    const newErrors = {};
    currentModuleFields.forEach((field) => {
      const val = formValues[field.field_key];

      if (field.required) {
        if (field.field_type === 'array' || (field.field_key === 'department' && Array.isArray(val))) {
          if (!val || val.length === 0) {
            newErrors[field.field_key] = field.field_key === 'department'
              ? `${field.field_label} is required`
              : `Add at least one entry for ${field.field_label}`;
          }
        } else if (field.field_type === 'checkbox') {
          if (!val) {
            newErrors[field.field_key] = 'You must accept the declaration to proceed';
          }
        } else if (val === undefined || val === null || val === '') {
          newErrors[field.field_key] = `${field.field_label} is required`;
        }
      }

      // Regex validation if provided
      if (val && field.validation) {
        try {
          const regex = new RegExp(field.validation);
          if (!regex.test(String(val))) {
            newErrors[field.field_key] = `Invalid format for ${field.field_label}`;
          }
        } catch (e) {
          // Ignore invalid regex
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Module Stepper Handlers
  const handleNext = () => {
    if (validateCurrentModule()) {
      if (currentModuleIndex < modules.length - 1) {
        setCurrentModuleIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } else {
      showToast('Please fix the highlighted errors before continuing.', 'error');
    }
  };

  const handleBack = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Final Form Submission
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateCurrentModule()) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    // Structure flat formValues into nested form_data expected by the backend
    const nestedFormData = {};
    modules.forEach((mod) => {
      nestedFormData[mod.module_key] = {};
      const modFields = fields.filter((f) => f.form_module_id === mod.id);
      modFields.forEach((field) => {
        if (formValues[field.field_key] !== undefined) {
          nestedFormData[mod.module_key][field.field_key] = formValues[field.field_key];
        }
      });
    });

    // Derive program_id based on selected department name
    const selectedDeptName = Array.isArray(formValues.department)
      ? formValues.department[0]
      : formValues.department;
    const deptObj = departments.find(
      (d) => d.department_name && d.department_name.trim().toLowerCase() === String(selectedDeptName || '').trim().toLowerCase()
    );
    const programId = deptObj ? deptObj.program_id : null;

    const payload = {
      program_id: programId,
      form_data: nestedFormData
    };

    try {
      setSubmitting(true);
      await submitApplication(payload);
      localStorage.removeItem('tec_application_draft');
      showToast('Application submitted successfully!', 'success');
      navigate('/payment');
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to submit application.';
      showToast(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };


  // Early Returns AFTER all Hook declarations (Rules of Hooks)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-tec-navy border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-sm">Loading dynamic application form fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Banner with Save as Draft & Reset Form Buttons */}
        <div className="bg-tec-navy text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-4 border-tec-gold">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-tec-gold text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>TNEA Counselling Code: {COLLEGE_CONFIG.counsellingCode} • Academic Year {academicYear}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Online Admission Application Form
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              {COLLEGE_CONFIG.name} — Kilambi, Kanchipuram
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2.5 rounded-xl bg-tec-gold hover:bg-tec-gold-hover text-slate-950 text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer border border-amber-300"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer border border-rose-400/40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Form</span>
            </button>
          </div>
        </div>

        {/* Main Layout: Left Sidebar (sticky) + Right Form (scrolls) */}
        <div className="flex items-start gap-6">
          {/* Left Sidebar – position sticky, stays fixed while right scrolls */}
          <div className="hidden lg:block w-72 shrink-0 sticky top-24 self-start z-10">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              {/* Header */}
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Form Modules</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Step {currentModuleIndex + 1} of {modules.length}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-tec-navy">{completionPercentage}%</span>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-5 pt-3">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-tec-navy h-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Scrollable Module List */}
              <div className="px-5 py-3 space-y-2 max-h-[calc(100vh-14rem)] overflow-y-auto">
                {modules.map((mod, idx) => {
                  const isActive = idx === currentModuleIndex;
                  const isCompleted = idx < currentModuleIndex;

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        if (idx <= currentModuleIndex || isCompleted) {
                          setCurrentModuleIndex(idx);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition border ${
                        isActive
                          ? 'bg-tec-navy text-white border-tec-navy shadow-md font-bold'
                          : isCompleted
                          ? 'bg-emerald-50 text-slate-800 border-emerald-200 hover:bg-emerald-100/60 font-semibold cursor-pointer'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-tec-gold text-slate-950'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm leading-snug">{mod.module_name}</span>
                      </div>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Last Saved Info */}
              {draftSavedAt && (
                <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Draft saved at {draftSavedAt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Main Form Container – takes remaining width, page scrolls naturally */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-tec-navy uppercase tracking-widest">
                  Step {currentModuleIndex + 1} of {modules.length}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {currentModule?.module_name}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                All fields marked with <span className="text-rose-500 font-bold">*</span> are required
              </span>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">

              {/* Fields Renderer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {currentModuleFields.map((field) => {
                  const value = formValues[field.field_key] ?? '';
                  const fieldError = errors[field.field_key];

                  // 1. Radio Input
                  if (field.field_type === 'radio') {
                    const options = field.choices || ['UG', 'PG'];
                    return (
                      <div key={field.id} className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-bold text-slate-800">
                          {field.field_label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <div className="flex flex-wrap gap-4">
                          {options.map((opt) => (
                            <label
                              key={opt}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-bold cursor-pointer transition ${
                                value === opt
                                  ? 'bg-tec-navy text-white border-tec-navy shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={field.field_key}
                                value={opt}
                                checked={value === opt}
                                onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                                className="hidden"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                        {fieldError && <p className="text-xs text-rose-600 font-semibold">{fieldError}</p>}
                      </div>
                    );
                  }

                  // 2. Select Dropdown Input
                  if (field.field_type === 'select') {
                    let options = field.choices || [];
                    if (field.field_key === 'department' && (!options || options.length === 0)) {
                      const currentProgram = formValues.program || 'UG';
                      options = departments
                        .filter((d) => d.program_level === currentProgram || !d.program_level)
                        .map((d) => d.department_name);

                      const deptArray = Array.isArray(value) ? value : (value ? [value] : []);

                      const handleDeptChoiceChange = (choiceIndex, val) => {
                        const nextDeptArray = [...deptArray];
                        nextDeptArray[choiceIndex] = val;
                        // Filter out empty trailing elements to keep array clean
                        const cleaned = [];
                        for (let i = 0; i < 3; i++) {
                          const v = nextDeptArray[i];
                          if (v !== undefined && v !== "") {
                            cleaned.push(v);
                          }
                        }
                        handleInputChange('department', cleaned);
                      };

                      return (
                        <div key={field.id} className="md:col-span-2 space-y-4">
                          <label className="block text-sm font-bold text-slate-800">
                            Course / Department Preference (Select up to 3 choices) {field.required && <span className="text-rose-500">*</span>}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Choice 1 */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-500">Choice 1 <span className="text-rose-500">*</span></span>
                              <select
                                value={deptArray[0] || ""}
                                onChange={(e) => handleDeptChoiceChange(0, e.target.value)}
                                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-tec-navy ${
                                  fieldError ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 bg-white'
                                }`}
                              >
                                <option value="">Select Choice 1</option>
                                {options.map((opt) => (
                                  <option key={opt} value={opt} disabled={deptArray.slice(1).includes(opt)}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Choice 2 */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-500">Choice 2 (Optional)</span>
                              <select
                                value={deptArray[1] || ""}
                                disabled={!deptArray[0]}
                                onChange={(e) => handleDeptChoiceChange(1, e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-tec-navy"
                              >
                                <option value="">Select Choice 2</option>
                                {options.map((opt) => (
                                  <option key={opt} value={opt} disabled={deptArray[0] === opt || deptArray[2] === opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Choice 3 */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold text-slate-500">Choice 3 (Optional)</span>
                              <select
                                value={deptArray[2] || ""}
                                disabled={!deptArray[1]}
                                onChange={(e) => handleDeptChoiceChange(2, e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-tec-navy"
                              >
                                <option value="">Select Choice 3</option>
                                {options.map((opt) => (
                                  <option key={opt} value={opt} disabled={deptArray[0] === opt || deptArray[1] === opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {fieldError && <p className="text-xs text-rose-600 font-semibold">{fieldError}</p>}
                        </div>
                      );
                    }

                    return (
                      <div key={field.id} className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-800">
                          {field.field_label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <select
                          value={value}
                          onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-tec-navy ${
                            fieldError ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 bg-white'
                          }`}
                        >
                          <option value="">Select {field.field_label}</option>
                          {options.map((opt) => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const lbl = typeof opt === 'object' ? opt.label : opt;
                            return (
                              <option key={val} value={val}>
                                {lbl}
                              </option>
                            );
                          })}
                        </select>
                        {fieldError && <p className="text-xs text-rose-600 font-semibold">{fieldError}</p>}
                      </div>
                    );
                  }

                  // 3. Textarea Input
                  if (field.field_type === 'textarea') {
                    return (
                      <div key={field.id} className="md:col-span-2 space-y-1.5">
                        <label className="block text-sm font-bold text-slate-800">
                          {field.field_label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <textarea
                          rows={3}
                          value={value}
                          placeholder={field.placeholder || `Enter ${field.field_label}`}
                          onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-tec-navy ${
                            fieldError ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 bg-white'
                          }`}
                        />
                        {fieldError && <p className="text-xs text-rose-600 font-semibold">{fieldError}</p>}
                      </div>
                    );
                  }

                  // 4. File Upload Input
                  if (field.field_type === 'file') {
                    return (
                      <div key={field.id} className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-800">
                          {field.field_label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-tec-navy transition bg-slate-50">
                          {value ? (
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                              <span className="truncate max-w-[200px]">✓ {value}</span>
                              <button
                                type="button"
                                onClick={() => handleInputChange(field.field_key, '')}
                                className="text-rose-600 hover:underline ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-1.5">
                              <Upload className="w-6 h-6 text-tec-navy" />
                              <span className="text-xs font-bold text-tec-navy">Click to Upload File</span>
                              <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 5MB</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileUpload(field.field_key, e.target.files[0])}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        {fieldError && <p className="text-xs text-rose-600 font-semibold">{fieldError}</p>}
                      </div>
                    );
                  }

                  // 5. Checkbox Input (Declaration)
                  if (field.field_type === 'checkbox') {
                    return (
                      <div key={field.id} className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => handleInputChange(field.field_key, e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-tec-navy focus:ring-tec-navy mt-0.5"
                          />
                          <span className="text-xs font-medium text-slate-700 leading-relaxed">
                            {field.field_label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                          </span>
                        </label>
                        {fieldError && <p className="text-xs text-rose-600 font-semibold">{fieldError}</p>}
                      </div>
                    );
                  }

                  // 6. Dynamic Array Table Input (Qualifications, Performance, Certificates)
                  if (field.field_type === 'array') {
                    const columns = field.choices || [];
                    const rows = formValues[field.field_key] || [];

                    return (
                      <div key={field.id} className="md:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-sm font-bold text-slate-900">
                              {field.field_label} {field.required && <span className="text-rose-500">*</span>}
                            </label>
                            {field.help_text && (
                              <p className="text-xs text-slate-500">{field.help_text}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddArrayRow(field.field_key, columns)}
                            className="px-3 py-1.5 rounded-lg bg-tec-navy text-white text-xs font-bold hover:bg-tec-navy-dark transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Entry</span>
                          </button>
                        </div>

                        {fieldError && <p className="text-xs text-rose-600 font-semibold">{fieldError}</p>}

                        {rows.length === 0 ? (
                          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                            No entries added yet. Click <strong>"Add Entry"</strong> above to populate details.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                <tr>
                                  {columns.map((col) => (
                                    <th key={col.key} className="p-3">
                                      {col.label} {col.required && <span className="text-rose-500">*</span>}
                                    </th>
                                  ))}
                                  <th className="p-3 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 bg-white">
                                {rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50/50">
                                    {columns.map((col) => {
                                      const colVal = row[col.key] ?? '';

                                      return (
                                        <td key={col.key} className="p-2.5">
                                          {col.type === 'select' ? (
                                            <select
                                              value={colVal}
                                              onChange={(e) =>
                                                handleArrayRowChange(field.field_key, rIdx, col.key, e.target.value, columns)
                                              }
                                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-tec-navy"
                                            >
                                              <option value="">Select</option>
                                              {(col.options || []).map((opt) => (
                                                <option key={opt} value={opt}>
                                                  {opt}
                                                </option>
                                              ))}
                                            </select>
                                          ) : col.type === 'file' ? (
                                            <div>
                                              {colVal ? (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-emerald-700 font-bold truncate max-w-[120px] block" title={colVal}>
                                                    ✓ {colVal.split('/').pop()}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleArrayRowChange(field.field_key, rIdx, col.key, '', columns)}
                                                    className="text-rose-600 hover:underline text-[10px]"
                                                  >
                                                    Remove
                                                  </button>
                                                </div>
                                              ) : (
                                                <input
                                                  type="file"
                                                  accept="image/*,application/pdf"
                                                  onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                      try {
                                                        showToast(`Uploading ${file.name}...`, 'info');
                                                        const res = await uploadDocument(file, col.key);
                                                        const fileUrl = res.data && res.data[0] ? res.data[0].file_url : file.name;
                                                        handleArrayRowChange(field.field_key, rIdx, col.key, fileUrl, columns);
                                                        showToast(`Uploaded ${file.name} successfully`, 'success');
                                                      } catch (err) {
                                                        showToast(`Failed to upload ${file.name}`, 'error');
                                                      }
                                                    }
                                                  }}
                                                  className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-tec-navy file:text-white"
                                                />
                                              )}
                                            </div>
                                          ) : (
                                            <input
                                              type={col.type === 'number' ? 'number' : 'text'}
                                              readOnly={col.readonly}
                                              value={colVal}
                                              placeholder={col.label}
                                              onChange={(e) =>
                                                handleArrayRowChange(field.field_key, rIdx, col.key, e.target.value, columns)
                                              }
                                              className={`w-full px-2.5 py-1.5 rounded border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-tec-navy ${
                                                col.readonly ? 'bg-slate-100 text-slate-500 font-bold' : 'border-slate-300'
                                              }`}
                                            />
                                          )}
                                        </td>
                                      );
                                    })}
                                    <td className="p-2.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveArrayRow(field.field_key, rIdx)}
                                        className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                        title="Remove entry"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 7. Standard Input (Text, Email, Number, Date)
                  const isNumber = field.field_type === 'number';
                  const isDate = field.field_type === 'date';
                  const isEmail = field.field_type === 'email';

                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-sm font-bold text-slate-800">
                        {field.field_label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type={isDate ? 'date' : isEmail ? 'email' : isNumber ? 'number' : 'text'}
                        value={value}
                        placeholder={field.placeholder || `Enter ${field.field_label}`}
                        onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-tec-navy ${
                          fieldError ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 bg-white'
                        }`}
                      />
                      {fieldError && <p className="text-xs text-rose-600 font-semibold">{fieldError}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Stepper Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentModuleIndex === 0}
                  onClick={handleBack}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
                    currentModuleIndex === 0
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'bg-slate-200 text-slate-800 hover:bg-slate-300 cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                {currentModuleIndex < modules.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-tec-navy text-white font-extrabold text-sm hover:bg-tec-navy-dark transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4 text-tec-gold" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 rounded-xl bg-tec-gold hover:bg-tec-gold-hover text-slate-950 font-black text-base shadow-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Apply;
