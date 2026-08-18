import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getFormModulesList,
  getFormFieldsList,
  getDepartmentsList,
  getProgramsList,
  createApplication,
  uploadDocuments
} from '../Api';
import { useAuth } from '../context/AuthContext';
import { COLLEGE_CONFIG } from '../Config/collegeConfig';
import { realtimeManager } from '../services/websocket';
import { DynamicFormModule } from '../components/application/DynamicFormModule';
import { ApplicationConfirmationModal } from '../components/application/ApplicationConfirmationModal';
import { ApplicationReview } from '../components/application/ApplicationReview';
import {
  FileText, ArrowRight, ArrowLeft, ShieldCheck,
  Save, RotateCcw, CheckCircle2, Layers, BookOpen, AlertCircle, Eye, Check, ClipboardList
} from 'lucide-react';

export function Apply() {
  const { user, showToast, academicYear, setApplication } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected Program ID from URL or Selection Step
  const urlProgramId = searchParams.get('program_id');
  const initialDegree = searchParams.get('degree') || 'UG';
  const initialDept = searchParams.get('dept') || '';

  // API Metadata State
  const [modules, setModules] = useState([]);
  const [fields, setFields] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgressMap, setUploadProgressMap] = useState({});

  // Selected Program & Department State
  const [selectedProgramId, setSelectedProgramId] = useState(urlProgramId ? Number(urlProgramId) : null);
  const [selectedDegree, setSelectedDegree] = useState(initialDegree);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState(initialDept);

  // Form Navigation & Values State
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isReviewStep, setIsReviewStep] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const rawDraft = localStorage.getItem('tec_application_draft');
    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft);
        if (parsed && parsed.formValues) {
          setFormValues(parsed.formValues);
          if (parsed.currentModuleIndex !== undefined) {
            setCurrentModuleIndex(parsed.currentModuleIndex);
          }
          if (parsed.selectedProgramId) {
            setSelectedProgramId(parsed.selectedProgramId);
          }
          if (parsed.savedAt) {
            setDraftSavedAt(parsed.savedAt);
          }
          showToast(`Restored saved application draft (${parsed.savedAt})`, 'info');
        }
      } catch (e) {
        console.error('Failed to parse saved draft:', e);
      }
    }
  }, [showToast]);

  // Fetch Academic Programs, Departments, Form-Modules, and Form-Fields
  const fetchFormSchema = useCallback(async () => {
    try {
      setLoading(true);
      const [modulesData, fieldsData, deptsData, progsData] = await Promise.all([
        getFormModulesList().catch(() => []),
        getFormFieldsList().catch(() => []),
        getDepartmentsList().catch(() => []),
        getProgramsList().catch(() => []),
      ]);

      const rawModules = Array.isArray(modulesData) ? modulesData : (modulesData?.data || []);
      const rawFields = Array.isArray(fieldsData) ? fieldsData : (fieldsData?.data || []);
      const rawDepts = Array.isArray(deptsData) ? deptsData : (deptsData?.data || []);
      const rawProgs = Array.isArray(progsData) ? progsData : (progsData?.data || []);

      const sortedModules = rawModules
        .filter((m) => m.is_active !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      setModules(sortedModules);
      setFields(rawFields.filter((f) => f.is_active !== false));
      setDepartments(rawDepts);
      setPrograms(rawProgs);

      // Auto-resolve selectedProgramId from department name if provided via URL
      if (!selectedProgramId && initialDept) {
        const matchedDept = rawDepts.find(
          (d) => String(d.department_name).trim().toLowerCase() === String(initialDept).trim().toLowerCase()
        );
        if (matchedDept && matchedDept.program_id) {
          setSelectedProgramId(matchedDept.program_id);
        }
      }
    } catch (err) {
      console.error('Failed to load application schema:', err);
      showToast('Failed to load application form schema.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, selectedProgramId, initialDept]);

  useEffect(() => {
    fetchFormSchema();
  }, [fetchFormSchema]);

  // Real-time WebSocket listener for dynamic schema updates
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe((payload) => {
      console.log('[Apply] Real-time schema update received:', payload);
      fetchFormSchema();
    });
    return unsubscribe;
  }, [fetchFormSchema]);

  // Handle Program Selection
  const handleSelectProgram = (programId, deptName, degreeLevel) => {
    setSelectedProgramId(programId);
    if (deptName) setSelectedDepartmentName(deptName);
    if (degreeLevel) setSelectedDegree(degreeLevel);
    setSearchParams({ program_id: programId });
    showToast('Program selected. Dynamic form loaded.', 'success');
  };

  // Active Module & Fields memoization (Hide Course Selection module when program is pre-selected)
  const activeModules = useMemo(() => {
    if (!selectedProgramId) return modules;
    return modules.filter((m) => {
      const key = (m.module_key || m.name || m.module_name || '').toLowerCase();
      return !key.includes('course_selection') && !key.includes('course selection');
    });
  }, [modules, selectedProgramId]);

  const currentModule = activeModules[currentModuleIndex] || null;
  const currentModuleFields = useMemo(() => {
    if (!currentModule) return [];
    return fields
      .filter((f) => f.form_module_id === currentModule.id)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [currentModule, fields]);

  // Completion Percentage calculation
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
        selectedProgramId,
        savedAt: timeStr,
      };
      localStorage.setItem('tec_application_draft', JSON.stringify(draftPayload));
      setDraftSavedAt(timeStr);
      showToast(`Application draft saved at ${timeStr}`, 'success');
    } catch (e) {
      showToast('Failed to save application draft.', 'error');
    }
  };

  // Reset Form
  const handleResetForm = () => {
    if (!window.confirm('Reset the entire application form? This will clear all entered data.')) return;
    localStorage.removeItem('tec_application_draft');
    setFormValues({});
    setCurrentModuleIndex(0);
    setErrors({});
    setDraftSavedAt(null);
    showToast('Form has been reset. All data cleared.', 'info');
  };

  // Handle Field Value Change
  const handleInputChange = (fieldKey, value) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
    if (errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: null }));
    }
  };

  // Array Row Operations
  const handleAddArrayRow = (fieldKey, columns) => {
    const newRow = {};
    columns.forEach((col) => {
      newRow[col.key] = col.type === 'number' ? '' : col.type === 'select' && col.options?.length ? (typeof col.options[0] === 'object' ? col.options[0].value : col.options[0]) : '';
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

  const handleArrayRowChange = (fieldKey, rowIndex, colKey, value) => {
    setFormValues((prev) => {
      const list = [...(prev[fieldKey] || [])];
      const updatedRow = { ...list[rowIndex], [colKey]: value };

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

  // Validate Specific Module Fields (Highlight ONLY ONE field at a time for clean UX)
  const validateModuleFields = (moduleFields, stopAtFirst = true) => {
    const newErrors = {};
    const isPg = String(selectedDegree || '').toUpperCase() === 'PG';
    for (const field of moduleFields) {
      const val = formValues[field.field_key];
      const key = (field.field_key || '').toLowerCase();
      let err = null;

      if (field.required) {
        if (field.field_type === 'array') {
          const isQual = field.field_key === 'qualifications' || field.field_key.includes('qualification');
          const expectedCount = isQual ? (isPg ? 3 : 2) : 1;

          if (!val || !Array.isArray(val) || val.length < expectedCount) {
            err = `Please complete all required qualification rows in the table`;
          } else {
            // Validate individual rows inside the array table
            for (let rIdx = 0; rIdx < val.length; rIdx++) {
              const row = val[rIdx] || {};
              const qualName = row.qualification || `Row ${rIdx + 1}`;

              // All fields in qualifications table rows are strictly compulsory!
              if (isQual) {
                if (!row.institution || !String(row.institution).trim()) {
                  err = `${qualName}: School / College name is required`;
                  break;
                }
                if (!row.board || !String(row.board).trim()) {
                  err = `${qualName}: Board / University name is required`;
                  break;
                }
                if (!row.register_number || !String(row.register_number).trim()) {
                  err = `${qualName}: Register Number is required`;
                  break;
                }
                if (!row.year_of_passing || !String(row.year_of_passing).trim()) {
                  err = `${qualName}: Year of Passing is required`;
                  break;
                }
                if (!row.percentage || !String(row.percentage).trim()) {
                  err = `${qualName}: Percentage is required`;
                  break;
                }
              }

              for (const k in row) {
                const colKey = k.toLowerCase();
                const v = String(row[k] || '').trim();

                // Year of passing validation: 4 digits between 1950 and current year
                if (colKey.includes('year')) {
                  const y = parseInt(v, 10);
                  const currentYear = new Date().getFullYear();
                  if (!v || isNaN(y) || y < 1950 || y > currentYear || v.length !== 4) {
                    err = `${qualName}: Year of Passing must be a valid 4-digit year (e.g. 2022)`;
                    break;
                  }
                }

                // Percentage validation: between 0 and 100
                if (colKey.includes('percentage')) {
                  const p = parseFloat(v);
                  if (v && (isNaN(p) || p < 0 || p > 100)) {
                    err = `${qualName}: Percentage must be between 0 and 100`;
                    break;
                  }
                }
              }
              if (err) break;
            }
          }
        }

        // Academic Performance Marks Validation (HSC 3 subjects vs Semester I to VI)
        if (field.field_key === 'academic_performance' || field.field_key.includes('performance')) {
          const list = Array.isArray(val) ? val : [];
          const qualList = formValues?.qualifications || [];
          const selectedQual = qualList[1]?.qualification || (isPg ? 'UG' : 'HSC');
          const isSemesterMode = isPg || selectedQual === 'Diploma';

          if (isSemesterMode) {
            const compulsorySemesters = ['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI'];
            for (const semLabel of compulsorySemesters) {
              const row = list.find((r) => r.semester === semLabel || r.subject === semLabel);
              if (!row || row.obtained_marks === undefined || row.obtained_marks === null || String(row.obtained_marks).trim() === '') {
                err = `Academic Performance: ${semLabel} obtained marks are required`;
                break;
              }
              const max = parseFloat(row.maximum_marks) || 0;
              const obt = parseFloat(row.obtained_marks) || 0;
              if (obt > max) {
                err = `Academic Performance: ${semLabel} obtained marks cannot exceed maximum marks (${max})`;
                break;
              }
            }
          } else {
            if (!list || list.length < 3) {
              err = `Academic Performance: Please enter marks for all 3 subjects`;
            } else {
              for (const row of list) {
                if (row.obtained_marks === undefined || row.obtained_marks === null || String(row.obtained_marks).trim() === '') {
                  err = `Academic Performance: ${row.subject || 'Subject'} obtained marks are required`;
                  break;
                }
                const max = parseFloat(row.maximum_marks) || 0;
                const obt = parseFloat(row.obtained_marks) || 0;
                if (obt > max) {
                  err = `Academic Performance: ${row.subject || 'Subject'} obtained marks cannot exceed maximum marks (${max})`;
                  break;
                }
              }
            }
          }
        } else if (field.field_type === 'checkbox') {
          if (!val) {
            err = `Please check ${field.field_label}`;
          }
        } else if (field.field_type === 'file') {
          if (!val) {
            err = `Document ${field.field_label} is required`;
          }
        } else if (val === undefined || val === null || val === '') {
          err = `${field.field_label} is required`;
        }
      }

      // Regex validation if provided
      if (!err && val && typeof val === 'string' && field.validation) {
        try {
          const regex = new RegExp(field.validation);
          if (!regex.test(val)) {
            err = `Invalid format for ${field.field_label}`;
          }
        } catch (e) {
          // Ignore invalid regex
        }
      }

      // Aadhaar validation: exactly 12 digits
      if (!err && val && typeof val === 'string' && (key.includes('aadhaar') || key.includes('aadhar') || key.includes('uid_number'))) {
        const digits = val.replace(/\D/g, '');
        if (digits.length > 0 && digits.length !== 12) {
          err = `Aadhaar number must be exactly 12 digits (currently ${digits.length})`;
        }
      }

      // Mobile / Phone validation: exactly 10 digits
      if (!err && val && typeof val === 'string' && (key.includes('mobile') || key.includes('phone') || key.includes('contact_number') || key.includes('whatsapp'))) {
        const digits = val.replace(/\D/g, '');
        if (digits.length > 0 && digits.length !== 10) {
          err = `Mobile number must be exactly 10 digits (currently ${digits.length})`;
        }
      }

      // Pincode validation: exactly 6 digits
      if (!err && val && typeof val === 'string' && (key.includes('pincode') || key.includes('pin_code') || key.includes('zipcode'))) {
        const digits = val.replace(/\D/g, '');
        if (digits.length > 0 && digits.length !== 6) {
          err = `Pincode must be exactly 6 digits (currently ${digits.length})`;
        }
      }

      // Date of Birth / Date validation: realistic 4-digit year between 1950 and current year
      if (!err && val && typeof val === 'string' && (field.field_type === 'date' || key.includes('date') || key.includes('dob') || key.includes('birth'))) {
        const dateParts = val.split('-');
        const year = parseInt(dateParts[0], 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1950 || year > currentYear) {
          err = `Please enter a valid ${field.field_label} (year must be between 1950 and ${currentYear})`;
        } else if (key.includes('birth') || key.includes('dob')) {
          if (year > currentYear - 10) {
            err = `Date of Birth year must be 2014 or earlier`;
          }
        }
      }

      if (err) {
        newErrors[field.field_key] = err;
        if (stopAtFirst) break;
      }
    }

    return newErrors;
  };


  // Stepper Handlers
  const handleNext = () => {
    const moduleErrors = validateModuleFields(currentModuleFields, true);
    if (Object.keys(moduleErrors).length === 0) {
      setErrors({});
      if (currentModuleIndex < activeModules.length - 1) {
        setCurrentModuleIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        handleProceedToReview();
      }
    } else {
      setErrors(moduleErrors);
      const firstErrorMsg = Object.values(moduleErrors)[0];
      showToast(firstErrorMsg, 'error');
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Validate all modules and transition to Review Screen (checks section by section, one field at a time)
  const handleProceedToReview = (e) => {
    if (e) e.preventDefault();

    for (let i = 0; i < activeModules.length; i++) {
      const mod = activeModules[i];
      const modFields = fields.filter((f) => f.form_module_id === mod.id);
      const modErrors = validateModuleFields(modFields, true);
      if (Object.keys(modErrors).length > 0) {
        setCurrentModuleIndex(i);
        setIsReviewStep(false);
        setErrors(modErrors);
        const firstErrorMsg = Object.values(modErrors)[0];
        showToast(firstErrorMsg, 'error');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
    }

    if (!selectedProgramId) {
      showToast('Please select a valid degree program before submitting.', 'error');
      return;
    }

    setErrors({});
    setIsReviewStep(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // FINAL SUBMISSION HANDLER (Triggered ONLY from ApplicationReview confirmation)
  const executeFinalSubmission = async () => {
    setSubmitting(true);
    let updatedValues = { ...formValues };

    try {
      // Stage 1: Identify and Upload Files (POST /api/documents/upload)
      const fileKeysToUpload = [];
      const formData = new FormData();
      formData.append('docType', 'application_documents');

      fields.forEach((field) => {
        if (field.field_type === 'file') {
          const val = formValues[field.field_key];
          // If value is a File object or has a raw File instance
          const rawFile = val instanceof File ? val : (val && val.file instanceof File ? val.file : null);
          if (rawFile) {
            fileKeysToUpload.push({ key: field.field_key, file: rawFile });
            formData.append(field.field_key, rawFile);
          }
        }
      });

      if (fileKeysToUpload.length > 0) {
        showToast(`Uploading ${fileKeysToUpload.length} document file(s) to R2 storage...`, 'info');
        
        // Execute Document Upload to Cloudflare R2
        const uploadRes = await uploadDocuments(formData, (percent) => {
          const progressObj = {};
          fileKeysToUpload.forEach((item) => { progressObj[item.key] = percent; });
          setUploadProgressMap(progressObj);
        });

        // Parse returned Cloudflare R2 file URLs
        const uploadedList = Array.isArray(uploadRes?.data) ? uploadRes.data : (uploadRes?.data?.files || []);
        let hasFailedFile = false;
        
        fileKeysToUpload.forEach((item, idx) => {
          const returnedItem = uploadedList.find((u) => u.file_name === item.file.name) || uploadedList[idx];
          const fileUrl = returnedItem?.file_url || returnedItem?.url || returnedItem?.path;
          if (fileUrl) {
            updatedValues[item.key] = fileUrl;
          } else {
            hasFailedFile = true;
          }
        });

        if (hasFailedFile || uploadedList.length === 0) {
          throw new Error('Document upload is currently unavailable due to a server issue. Application creation blocked.');
        }

        setFormValues(updatedValues);
        showToast('All documents uploaded to Cloudflare R2 successfully!', 'success');
      }

      // Stage 2: Construct Dynamic form_data Grouped by module_key & Create Application
      const nestedFormData = {};
      modules.forEach((mod) => {
        const mKey = mod.module_key || mod.name?.toLowerCase().replace(/\s+/g, '_') || `module_${mod.id}`;
        nestedFormData[mKey] = {};
        const modFields = fields.filter((f) => f.form_module_id === mod.id);
        modFields.forEach((field) => {
          if (updatedValues[field.field_key] !== undefined) {
            nestedFormData[mKey][field.field_key] = updatedValues[field.field_key];
          }
        });
      });

      // Auto-fill course_selection from pre-selected program & department
      if (selectedProgramId) {
        nestedFormData.course_selection = {
          program: selectedDegree || 'UG',
          department: selectedDepartmentName || '',
          ...nestedFormData.course_selection,
        };
      }

      const payload = {
        program_id: Number(selectedProgramId),
        form_data: nestedFormData,
      };

      showToast('Creating admission application...', 'info');
      const createRes = await createApplication(payload);
      const appData = createRes.data || createRes.application || createRes;

      // Update AuthContext & UI State
      setApplication(appData);
      setSubmittedApplication(appData);
      localStorage.removeItem('tec_application_draft');
      showToast('Application submitted successfully!', 'success');

    } catch (err) {
      console.error('Application Submission Error:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to submit application.';
      showToast(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg, 'error');
    } finally {
      setSubmitting(false);
      setUploadProgressMap({});
    }
  };

  // Unauthenticated user redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Loading State
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

  // PREREQUISITE STEP: Program Selection Screen (If program_id is not selected yet)
  if (!selectedProgramId) {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="bg-tec-navy text-white rounded-3xl p-8 shadow-xl text-center border-b-4 border-tec-gold space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-tec-gold text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Step 1 of Admission Process</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Select Degree Program</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
              Please choose the degree program and department you wish to apply for at {COLLEGE_CONFIG.name}.
            </p>
          </div>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => {
              const prog = programs.find((p) => p.id === dept.program_id) || {};
              const degreeLevel = prog.program_level || 'UG';
              const displayName = prog.program_name ? `${prog.program_name} - ${dept.department_name}` : dept.department_name;

              return (
                <div
                  key={dept.id}
                  onClick={() => handleSelectProgram(dept.program_id, displayName, degreeLevel)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl hover:border-tec-navy p-6 cursor-pointer transition flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-0.5 rounded-full bg-tec-navy/10 text-tec-navy text-xs font-extrabold">
                      {degreeLevel} Degree
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-tec-navy transition">
                      {displayName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Duration: {prog.duration ? `${prog.duration} Years` : (degreeLevel === 'UG' ? '4 Years' : '2 Years')} • Full Time
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-tec-navy group-hover:translate-x-1 transition">
                    <span>Fill Application Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Post-Submission Confirmation Modal */}
        {submittedApplication && (
          <ApplicationConfirmationModal
            applicationData={submittedApplication}
            onClose={() => setSubmittedApplication(null)}
          />
        )}

        {/* Top Header Banner */}
        <div className="bg-tec-navy text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-4 border-tec-gold">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-tec-gold text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>TNEA Code: {COLLEGE_CONFIG.counsellingCode} • Academic Year {academicYear}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Online Application Form
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Program ID: <span className="font-bold text-tec-gold">Prog-{selectedProgramId}</span> {selectedDepartmentName ? `(${selectedDepartmentName})` : ''}
            </p>
          </div>

          {/* Actions: Save Draft & Change Program & Reset Form */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedProgramId(null)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Change Program</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2.5 rounded-xl bg-tec-gold hover:bg-tec-gold-hover text-slate-950 text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer border border-amber-300"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer border border-rose-400/40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Main Application Layout: Sidebar (Sticky) + Active Module Form */}
        <div className="flex items-start gap-6">
          
          {/* Left Sidebar Stepper Navigation */}
          <div className="hidden lg:block w-72 shrink-0 sticky top-24 self-start z-10">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Form Sections</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Step {currentModuleIndex + 1} of {activeModules.length}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-tec-navy">{completionPercentage}%</span>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Completed</span>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="px-5 pt-3">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-tec-navy h-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Module Nav Items */}
              <div className="px-5 py-3 space-y-2 max-h-[calc(100vh-14rem)] overflow-y-auto">
                {activeModules.map((mod, idx) => {
                  const isActive = !isReviewStep && idx === currentModuleIndex;
                  const isCompleted = idx < currentModuleIndex || isReviewStep;

                  const handleStepClick = () => {
                    if (isCompleted || isReviewStep) {
                      setCurrentModuleIndex(idx);
                      setIsReviewStep(false);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }
                  };

                  return (
                    <div
                      key={mod.id}
                      onClick={handleStepClick}
                      className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${
                        isActive
                          ? 'bg-tec-navy text-white font-extrabold shadow-md'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 cursor-pointer hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-400 font-medium cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isActive
                          ? 'bg-tec-gold text-slate-950 font-black'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400 font-bold'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className="truncate text-xs">{mod.module_name || mod.name}</span>
                    </div>
                  );
                })}

                {/* Review Step Nav Item */}
                <div
                  onClick={handleProceedToReview}
                  className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 border ${
                    isReviewStep
                      ? 'bg-tec-navy text-white font-extrabold shadow-md border-tec-navy'
                      : 'bg-amber-50/60 text-amber-900 font-bold border-amber-200 cursor-pointer hover:bg-amber-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isReviewStep ? 'bg-tec-gold text-slate-950 font-black' : 'bg-amber-400 text-slate-950 font-bold'
                  }`}>
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate text-xs">Review &amp; Submit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Form Container */}
          <div className="flex-grow space-y-6">
            
            {/* Review Step Renderer */}
            {isReviewStep ? (
              <ApplicationReview
                modules={activeModules}
                fields={fields}
                formValues={formValues}
                selectedProgramName={selectedDepartmentName}
                onEditModule={(modIdx) => {
                  setCurrentModuleIndex(modIdx);
                  setIsReviewStep(false);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onBackToForm={() => {
                  setIsReviewStep(false);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onConfirmSubmit={executeFinalSubmission}
                submitting={submitting}
              />
            ) : currentModule ? (
              <form onSubmit={handleProceedToReview} className="space-y-6">
                <DynamicFormModule
                  module={currentModule}
                  fields={currentModuleFields}
                  formValues={formValues}
                  errors={errors}
                  uploadProgressMap={uploadProgressMap}
                  onChange={handleInputChange}
                  onAddArrayRow={handleAddArrayRow}
                  onRemoveArrayRow={handleRemoveArrayRow}
                  onArrayRowChange={handleArrayRowChange}
                  programLevel={selectedDegree || 'UG'}
                />

                {/* Module Navigation & Review Buttons */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentModuleIndex === 0}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                      currentModuleIndex === 0
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Section</span>
                  </button>

                  {currentModuleIndex < modules.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl bg-tec-navy hover:bg-tec-navy-dark text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <span>Next Section</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-tec-gold hover:bg-tec-gold-hover text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg transition cursor-pointer border border-amber-300"
                    >
                      <Eye className="w-5 h-5 text-slate-950" />
                      <span>Review Application</span>
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 font-bold text-sm">
                No form modules available.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
