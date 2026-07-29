import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema } from '../utils/validation';
import { submitApplication, saveDraft, getSavedDraft } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  COLLEGE_INFO, UG_PROGRAMS, PG_PROGRAMS, COMMUNITIES, RELIGIONS, STATES 
} from '../utils/constants';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { SectionNav, SECTIONS } from '../components/application/SectionNav';
import { Calculator, Save, ArrowRight, Plus, Trash2, X, GraduationCap } from 'lucide-react';

const REGULATION_OPTIONS = ['Regulation 2021', 'Regulation 2017', 'Regulation 2013', 'Regulation 2008', 'N/A'];

/**
 * Nested Qualification Item Component
 * Renders Level, Board/Univ, Regulation, School/College, Year, Overall % and nested Subject Table
 */
function QualificationItem({ qualIndex, control, register, errors, watch, removeQual, canRemove }) {
  const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({
    control,
    name: `qualifications.${qualIndex}.subjects`
  });

  const currentLevel = watch ? watch(`qualifications.${qualIndex}.level`) : '';
  const showRegulationAndCode = currentLevel === 'UG Degree' || currentLevel === 'Diploma' || currentLevel === 'Other Certificate';

  return (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-5 relative transition hover:border-tec-navy/30">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold text-tec-navy uppercase tracking-wider flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-tec-gold" />
          <span>Qualification #{qualIndex + 1}</span>
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => removeQual(qualIndex)}
            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Block</span>
          </button>
        )}
      </div>

      {/* Even 3-Column Grid Layout for Labels & Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        <Select
          label="Qualification Level"
          options={['SSLC (10th)', 'HSC (12th)', 'Diploma', 'UG Degree', 'Other Certificate']}
          required
          error={errors.qualifications?.[qualIndex]?.level}
          {...register(`qualifications.${qualIndex}.level`)}
        />

        <Input
          label="Board / University"
          placeholder="e.g. State Board / Anna Univ"
          required
          error={errors.qualifications?.[qualIndex]?.boardOrUniversity}
          {...register(`qualifications.${qualIndex}.boardOrUniversity`)}
        />

        {showRegulationAndCode && (
          <Select
            label="Academic Regulation"
            options={REGULATION_OPTIONS}
            placeholder="Select Regulation"
            error={errors.qualifications?.[qualIndex]?.regulation}
            {...register(`qualifications.${qualIndex}.regulation`)}
          />
        )}

        <Input
          label="School / College Name"
          placeholder="e.g. Govt HSS / TEC College"
          required
          error={errors.qualifications?.[qualIndex]?.institutionName}
          {...register(`qualifications.${qualIndex}.institutionName`)}
        />

        <Input
          label="Year of Passing"
          placeholder="YYYY (e.g. 2024)"
          required
          error={errors.qualifications?.[qualIndex]?.yearOfPassing}
          {...register(`qualifications.${qualIndex}.yearOfPassing`)}
        />

        <Input
          label="Overall Percentage (%)"
          type="number"
          step="0.1"
          placeholder="e.g. 88.5"
          required
          error={errors.qualifications?.[qualIndex]?.overallPercentage}
          {...register(`qualifications.${qualIndex}.overallPercentage`)}
        />
      </div>

      {/* Subject Wise Table */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Subject-wise Marks & Breakdown:
          </label>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-tec-navy/5 border-b border-slate-200 text-tec-navy font-bold">
                {showRegulationAndCode && <th className="p-2.5 w-36">Subject Code</th>}
                <th className="p-2.5">Subject Name</th>
                <th className="p-2.5 w-32">Marks Obtained</th>
                <th className="p-2.5 w-32">Max Marks</th>
                <th className="p-2.5 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectFields.map((sub, subIdx) => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  {showRegulationAndCode && (
                    <td className="p-2">
                      <Input
                        placeholder="e.g. CS8591"
                        error={errors.qualifications?.[qualIndex]?.subjects?.[subIdx]?.subjectCode}
                        {...register(`qualifications.${qualIndex}.subjects.${subIdx}.subjectCode`)}
                      />
                    </td>
                  )}
                  <td className="p-2">
                    <Input
                      placeholder="e.g. Mathematics"
                      error={errors.qualifications?.[qualIndex]?.subjects?.[subIdx]?.subjectName}
                      {...register(`qualifications.${qualIndex}.subjects.${subIdx}.subjectName`)}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      placeholder="Obtained"
                      error={errors.qualifications?.[qualIndex]?.subjects?.[subIdx]?.marksObtained}
                      {...register(`qualifications.${qualIndex}.subjects.${subIdx}.marksObtained`)}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      placeholder="100"
                      error={errors.qualifications?.[qualIndex]?.subjects?.[subIdx]?.maxMarks}
                      {...register(`qualifications.${qualIndex}.subjects.${subIdx}.maxMarks`)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    {subjectFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(subIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Remove Subject"
                      >
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-2.5 flex justify-end">
          <button
            type="button"
            onClick={() => appendSubject({ subjectCode: '', subjectName: '', marksObtained: '', maxMarks: 100 })}
            className="text-xs font-bold text-tec-navy hover:text-tec-gold flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-200 transition"
          >
            <Plus className="w-3.5 h-3.5 text-tec-navy" />
            <span>Add Subject Row</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Apply() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, showToast, refreshApplicationStatus } = useAuth();
  
  const [activeSection, setActiveSection] = useState('section-a');
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill degree and department if coming from home page cards
  const paramDegree = searchParams.get('degree') || 'UG';
  const paramDept = searchParams.get('dept') || '';

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      degreeLevel: paramDegree,
      preference1: paramDept || (paramDegree === 'PG' ? PG_PROGRAMS[0] : UG_PROGRAMS[0]),
      preference2: paramDegree === 'PG' ? PG_PROGRAMS[1] : UG_PROGRAMS[1],
      preference3: paramDegree === 'PG' ? PG_PROGRAMS[2] : UG_PROGRAMS[2],

      fullName: user?.fullName || '',
      dob: '2005-05-15',
      gender: 'Male',
      nationality: 'Indian',
      religion: 'Hinduism',
      community: 'BC',
      caste: 'Mudaliar',
      aadharNo: '789012345678',

      address: '123 Gandhi Road, Kilambi',
      city: 'Kanchipuram',
      district: 'Kancheepuram',
      state: 'Tamil Nadu',
      pincode: '631551',
      mobile: user?.mobile || '9876543210',
      email: user?.email || 'applicant@example.com',
      parentName: 'Sundaram S',
      parentMobile: '9443322110',

      qualifications: [
        {
          level: 'SSLC (10th)',
          boardOrUniversity: 'State Board (Tamil Nadu)',
          institutionName: 'Govt Higher Secondary School',
          yearOfPassing: '2022',
          overallPercentage: 88.5,
          regulation: 'N/A',
          subjects: [
            { subjectCode: '1001', subjectName: 'Language (Tamil/English)', marksObtained: 90, maxMarks: 100 },
            { subjectCode: '1002', subjectName: 'Science', marksObtained: 88, maxMarks: 100 },
            { subjectCode: '1003', subjectName: 'Mathematics', marksObtained: 92, maxMarks: 100 },
          ]
        },
        {
          level: 'HSC (12th)',
          boardOrUniversity: 'State Board (Tamil Nadu)',
          institutionName: 'Govt Higher Secondary School',
          yearOfPassing: '2024',
          overallPercentage: 91.0,
          regulation: 'N/A',
          subjects: [
            { subjectCode: '2001', subjectName: 'Mathematics', marksObtained: 94, maxMarks: 100 },
            { subjectCode: '2002', subjectName: 'Physics', marksObtained: 92, maxMarks: 100 },
            { subjectCode: '2003', subjectName: 'Chemistry', marksObtained: 90, maxMarks: 100 },
          ]
        }
      ],

      counsellingCode: '1517',
      tneaAppNo: 'TNEA2026-8912',
      entranceRank: '',

      doc10th: { name: '10th_Marksheet.pdf', size: '240 KB' },
      doc12th: { name: '12th_Marksheet.pdf', size: '310 KB' },
      docUgDegree: { name: 'UG_Consolidated_Marksheet.pdf', size: '420 KB' },
      docTransferCert: { name: 'Transfer_Certificate.pdf', size: '180 KB' },
      docCommunityCert: { name: 'Community_Certificate.pdf', size: '190 KB' },
      docAadhar: { name: 'Aadhar_Card.pdf', size: '150 KB' },
      docPhoto: { name: 'Passport_Photo.jpg', size: '95 KB' },

      declarationAgreed: true,
    },
  });

  // Qualifications Field Array
  const { fields: qualFields, append: appendQual, remove: removeQual } = useFieldArray({
    control,
    name: 'qualifications'
  });

  // Watch fields for live computations
  const degreeLevel = watch('degreeLevel');
  const pref1 = watch('preference1');
  const pref2 = watch('preference2');
  const pref3 = watch('preference3');
  const formValues = watch();

  // Dynamic Filtering for 3 Course Preferences
  const availableCourses = React.useMemo(() => {
    return degreeLevel === 'PG' ? PG_PROGRAMS : UG_PROGRAMS;
  }, [degreeLevel]);

  const optionsPref1 = React.useMemo(() => {
    return availableCourses.filter(c => c !== pref2 && c !== pref3);
  }, [availableCourses, pref2, pref3]);

  const optionsPref2 = React.useMemo(() => {
    return availableCourses.filter(c => c !== pref1 && c !== pref3);
  }, [availableCourses, pref1, pref3]);

  const optionsPref3 = React.useMemo(() => {
    return availableCourses.filter(c => c !== pref1 && c !== pref2);
  }, [availableCourses, pref1, pref2]);

  // Adjust preferences and append UG Degree block if degree level changes
  useEffect(() => {
    const courses = degreeLevel === 'PG' ? PG_PROGRAMS : UG_PROGRAMS;
    if (!courses.includes(pref1)) setValue('preference1', courses[0]);
    if (!courses.includes(pref2)) setValue('preference2', courses[1] || courses[0]);
    if (!courses.includes(pref3)) setValue('preference3', courses[2] || courses[0]);

    // If PG is selected, check if UG Degree qualification block exists
    if (degreeLevel === 'PG') {
      const currentQuals = formValues.qualifications || [];
      const hasUg = currentQuals.some(q => q?.level?.includes('UG Degree'));
      if (!hasUg) {
        appendQual({
          level: 'UG Degree',
          boardOrUniversity: 'Anna University / Recognized Univ',
          institutionName: 'Thirumalai Engineering College',
          yearOfPassing: '2026',
          overallPercentage: 82.5,
          regulation: 'Regulation 2021',
          subjects: [
            { subjectCode: 'CS8591', subjectName: 'Computer Networks', marksObtained: 85, maxMarks: 100 },
            { subjectCode: 'CS8501', subjectName: 'Theory of Computation', marksObtained: 80, maxMarks: 100 },
            { subjectCode: 'CS8592', subjectName: 'OOAD', marksObtained: 83, maxMarks: 100 },
          ]
        });
      }
    }
  }, [degreeLevel, pref1, pref2, pref3, setValue, formValues.qualifications, appendQual]);

  // Compute TNEA Cutoff Score dynamically from HSC subjects
  const computedCutoff = React.useMemo(() => {
    const quals = formValues.qualifications || [];
    const hsc = quals.find(q => q?.level?.includes('12th') || q?.level?.includes('HSC'));
    if (!hsc || !hsc.subjects || hsc.subjects.length === 0) return null;

    const getSubPct = (regex) => {
      const sub = hsc.subjects.find(s => regex.test(s?.subjectName || ''));
      if (!sub || !sub.maxMarks) return 0;
      return (parseFloat(sub.marksObtained || 0) / parseFloat(sub.maxMarks || 100)) * 100;
    };

    const m = getSubPct(/math|maths|mathematics/i);
    const p = getSubPct(/phys|physics/i);
    const c = getSubPct(/chem|chemistry/i);

    if (!m && !p && !c) return null;
    return (m + (p / 2) + (c / 2)).toFixed(2);
  }, [formValues.qualifications]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = getSavedDraft();
    if (draft && draft.data) {
      Object.keys(draft.data).forEach((key) => {
        setValue(key, draft.data[key]);
      });
      if (draft.savedAt) {
        setLastSavedTime(new Date(draft.savedAt).toLocaleTimeString());
      }
    }
  }, [setValue]);

  // Auto-save draft on form change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(formValues);
      setLastSavedTime(new Date().toLocaleTimeString());
    }, 2000);
    return () => clearTimeout(timer);
  }, [formValues]);

  // Handle section scrolling spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = document.getElementById(SECTIONS[i].id);
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manual save draft trigger button
  const handleManualSaveDraft = () => {
    saveDraft(formValues);
    const now = new Date().toLocaleTimeString();
    setLastSavedTime(now);
    showToast(`Draft saved to device storage at ${now}`, 'success');
  };

  // Scroll to first invalid field when Zod validation fails
  const onFormError = (errorsObj) => {
    const errorKeys = Object.keys(errorsObj);
    if (errorKeys.length > 0) {
      showToast(`Form incomplete. Please resolve highlighted errors (${errorKeys.length} issues).`, 'error');
      const firstErrorKey = errorKeys[0];
      const el = document.getElementsByName(firstErrorKey)[0];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }
  };

  const onFinalSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await submitApplication(data);
      await refreshApplicationStatus();
      showToast('Application submitted successfully to Thirumalai Engineering College!', 'success');
      navigate('/status');
    } catch (err) {
      showToast(err.message || 'Submission failed. Please check details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-8 px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      
      {/* Top Application Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-tec-navy text-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-tec-gold overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-tec-gold text-xs font-bold mb-2">
            <span>TNEA Counselling Code: {COLLEGE_INFO.counsellingCode}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Online Admission Application Form
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Academic Session 2026 - 2027 • Complete all mandatory sections below
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="accent"
            onClick={handleManualSaveDraft}
            className="text-xs font-bold"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sticky Progress Nav (Desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <SectionNav
            activeSection={activeSection}
            completedSections={{
              'section-a': !!(formValues.preference1 && formValues.preference2 && formValues.preference3),
              'section-b': !!(formValues.fullName && formValues.dob && formValues.aadharNo),
              'section-c': !!(formValues.address && formValues.city && formValues.mobile),
              'section-d': !!(formValues.qualifications && formValues.qualifications.length > 0),
              'section-e': true,
              'section-f': !!(formValues.doc10th && formValues.docTransferCert),
              'section-g': formValues.declarationAgreed,
            }}
            onSaveDraft={handleManualSaveDraft}
            lastSavedTime={lastSavedTime}
          />
        </div>

        {/* Main Application Form Sections */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSubmit(onFinalSubmit, onFormError)} className="space-y-8">
            
            {/* SECTION A: PROGRAM & BRANCH SELECTION */}
            <section id="section-a" className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-tec-navy text-white flex items-center justify-center font-bold">
                  A
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Section A: Program & Branch Selection</h2>
                  <p className="text-xs text-slate-500">Select Degree Level (UG / PG) and 3 preferred engineering branches</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Select
                  label="Degree Level"
                  options={['UG', 'PG']}
                  required
                  error={errors.degreeLevel}
                  {...register('degreeLevel')}
                />

                <Select
                  label="1st Preference Course"
                  options={optionsPref1}
                  required
                  placeholder="Select 1st Choice"
                  error={errors.preference1}
                  {...register('preference1')}
                />

                <Select
                  label="2nd Preference Course"
                  options={optionsPref2}
                  required
                  placeholder="Select 2nd Choice"
                  error={errors.preference2}
                  {...register('preference2')}
                />

                <Select
                  label="3rd Preference Course"
                  options={optionsPref3}
                  required
                  placeholder="Select 3rd Choice"
                  error={errors.preference3}
                  {...register('preference3')}
                />
              </div>
            </section>


            {/* SECTION B: PERSONAL DETAILS */}
            <section id="section-b" className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-tec-navy text-white flex items-center justify-center font-bold">
                  B
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Section B: Personal Details</h2>
                  <p className="text-xs text-slate-500">Applicant identity and official identification numbers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input
                    label="Full Name of Applicant (as per SSLC / 10th Marksheet)"
                    placeholder="e.g. KARTHIK RAJA S"
                    required
                    error={errors.fullName}
                    {...register('fullName')}
                  />
                </div>

                <Input
                  label="Date of Birth"
                  type="date"
                  required
                  error={errors.dob}
                  {...register('dob')}
                />

                <Select
                  label="Gender"
                  options={['Male', 'Female', 'Other']}
                  required
                  error={errors.gender}
                  {...register('gender')}
                />

                <Input
                  label="Nationality"
                  required
                  error={errors.nationality}
                  {...register('nationality')}
                />

                <Select
                  label="Religion"
                  options={RELIGIONS}
                  required
                  error={errors.religion}
                  {...register('religion')}
                />

                <Select
                  label="Community"
                  options={COMMUNITIES}
                  required
                  error={errors.community}
                  {...register('community')}
                />

                <Input
                  label="Caste / Sub-Caste Name"
                  placeholder="e.g. Agamudayar / Mudaliar"
                  required
                  error={errors.caste}
                  {...register('caste')}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Aadhar Card Number (12 Digits)"
                    placeholder="12-digit Aadhar number without spaces"
                    required
                    error={errors.aadharNo}
                    {...register('aadharNo')}
                  />
                </div>
              </div>
            </section>


            {/* SECTION C: CONTACT DETAILS */}
            <section id="section-c" className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-tec-navy text-white flex items-center justify-center font-bold">
                  C
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Section C: Contact & Parent Details</h2>
                  <p className="text-xs text-slate-500">Permanent residential address and guardian contacts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input
                    label="Street Address / Door No."
                    placeholder="House No., Street Name, Area"
                    required
                    error={errors.address}
                    {...register('address')}
                  />
                </div>

                <Input
                  label="City / Town"
                  required
                  error={errors.city}
                  {...register('city')}
                />

                <Input
                  label="District"
                  required
                  error={errors.district}
                  {...register('district')}
                />

                <Select
                  label="State"
                  options={STATES}
                  required
                  error={errors.state}
                  {...register('state')}
                />

                <Input
                  label="Pincode"
                  placeholder="6-digit Pincode"
                  required
                  error={errors.pincode}
                  {...register('pincode')}
                />

                <Input
                  label="Applicant Mobile Number"
                  type="tel"
                  required
                  error={errors.mobile}
                  {...register('mobile')}
                />

                <Input
                  label="Applicant Email Address"
                  type="email"
                  required
                  error={errors.email}
                  {...register('email')}
                />

                <Input
                  label="Parent / Guardian Name"
                  required
                  error={errors.parentName}
                  {...register('parentName')}
                />

                <Input
                  label="Parent / Guardian Mobile Number"
                  type="tel"
                  required
                  error={errors.parentMobile}
                  {...register('parentMobile')}
                />
              </div>
            </section>


            {/* SECTION D: DYNAMIC ACADEMIC QUALIFICATIONS */}
            <section id="section-d" className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-tec-navy text-white flex items-center justify-center font-bold">
                    D
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Section D: Academic Qualification</h2>
                    <p className="text-xs text-slate-500">
                      Add SSLC (10th), HSC (12th), Diploma, or UG Degree qualifications with regulation and subject-wise code & marks
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => appendQual({
                    level: degreeLevel === 'PG' ? 'UG Degree' : 'Diploma',
                    boardOrUniversity: '',
                    institutionName: '',
                    yearOfPassing: '',
                    overallPercentage: '',
                    regulation: degreeLevel === 'PG' ? 'Regulation 2021' : 'N/A',
                    subjects: [
                      { subjectCode: '', subjectName: '', marksObtained: '', maxMarks: 100 }
                    ]
                  })}
                  className="px-3.5 py-2 rounded-lg bg-tec-navy hover:bg-tec-navy-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4 text-tec-gold" />
                  <span>Add Qualification</span>
                </button>
              </div>

              {/* Qualification Blocks List */}
              <div className="space-y-6">
                {qualFields.map((qual, qualIdx) => (
                  <QualificationItem
                    key={qual.id}
                    qualIndex={qualIdx}
                    control={control}
                    register={register}
                    errors={errors}
                    watch={watch}
                    removeQual={removeQual}
                    canRemove={qualFields.length > 1}
                  />
                ))}
              </div>

              {/* Dynamic TNEA Cutoff Score Banner (Calculated from HSC qualification if available) */}
              {computedCutoff !== null && (
                <div className="p-4 rounded-xl bg-tec-navy text-white flex items-center justify-between border border-tec-gold/50 shadow-md">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-8 h-8 text-tec-gold shrink-0" />
                    <div>
                      <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">
                        TNEA Engineering Cutoff Calculation (HSC 12th)
                      </span>
                      <p className="text-xs text-slate-300">
                        Formula: Maths% + (Physics% ÷ 2) + (Chemistry% ÷ 2)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-tec-gold">{computedCutoff}</span>
                    <span className="text-xs text-slate-300 block">/ 200.00</span>
                  </div>
                </div>
              )}

            </section>


            {/* SECTION E: ENTRANCE/COUNSELLING DETAILS */}
            <section id="section-e" className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-tec-navy text-white flex items-center justify-center font-bold">
                  E
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Section E: Counselling & Entrance Details</h2>
                  <p className="text-xs text-slate-500">TNEA / TANCET / GATE details (if applicable)</p>
                </div>
              </div>

              {/* Even 3-Column Grid Layout for Section E */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                <Input
                  label="College Counselling Code"
                  value="1517 (Thirumalai Engineering College)"
                  disabled
                  helperText="Prefilled government counselling code"
                />

                <Input
                  label="TNEA / Entrance Application No."
                  placeholder="e.g. TNEA2026-98124"
                  error={errors.tneaAppNo}
                  {...register('tneaAppNo')}
                />

                <Input
                  label="Entrance Rank / Score (Optional)"
                  placeholder="e.g. TNEA Rank or TANCET Score"
                  error={errors.entranceRank}
                  {...register('entranceRank')}
                />
              </div>
            </section>


            {/* SECTION F: DOCUMENT UPLOAD */}
            <section id="section-f" className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-tec-navy text-white flex items-center justify-center font-bold">
                  F
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Section F: Document Uploads</h2>
                  <p className="text-xs text-slate-500">Upload scanned copies of required certificates (PDF / JPG under 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="doc10th"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="10th (SSLC) Marksheet"
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.doc10th}
                    />
                  )}
                />

                <Controller
                  name="doc12th"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="12th (HSC) / Diploma Marksheet"
                      required={degreeLevel === 'UG'}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.doc12th}
                    />
                  )}
                />

                {degreeLevel === 'PG' && (
                  <Controller
                    name="docUgDegree"
                    control={control}
                    render={({ field }) => (
                      <FileUpload
                        label="UG Degree Consolidated Marksheet / Provisional Cert"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.docUgDegree}
                      />
                    )}
                  />
                )}

                <Controller
                  name="docTransferCert"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="Transfer Certificate (TC)"
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.docTransferCert}
                    />
                  )}
                />

                <Controller
                  name="docCommunityCert"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="Community Certificate"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.docCommunityCert}
                    />
                  )}
                />

                <Controller
                  name="docAadhar"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="Aadhar Card Copy"
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.docAadhar}
                    />
                  )}
                />

                <Controller
                  name="docPhoto"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="Passport Size Photo"
                      accept=".jpg,.jpeg,.png"
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.docPhoto}
                    />
                  )}
                />
              </div>
            </section>


            {/* SECTION G: DECLARATION & SUBMISSION */}
            <section id="section-g" className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-tec-navy text-white flex items-center justify-center font-bold">
                  G
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Section G: Declaration & Final Submission</h2>
                  <p className="text-xs text-slate-500">Confirm accuracy of information and submit application</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-tec-navy focus:ring-tec-navy mt-0.5"
                    {...register('declarationAgreed')}
                  />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    I hereby declare that all the information furnished above is true, complete, and correct to the best of my knowledge and belief. I understand that if any information is found false or inaccurate, my application to Thirumalai Engineering College (Code: 1517) shall be subject to immediate cancellation.
                  </span>
                </label>
                {errors.declarationAgreed && (
                  <p className="mt-2 text-xs text-rose-600 font-bold">⚠️ {errors.declarationAgreed.message}</p>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleManualSaveDraft}
                  className="w-full sm:w-auto font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Progress Draft</span>
                </Button>

                <Button
                  type="submit"
                  variant="accent"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold shadow-lg"
                >
                  <span>Submit Application to TEC</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </section>

          </form>
        </div>

      </div>
    </div>
  );
}
