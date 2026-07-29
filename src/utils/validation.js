import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Enter mobile number or email'),
  password: z.string().min(1, 'Password is required'),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const subjectSchema = z.object({
  subjectCode: z.string().optional(),
  subjectName: z.string().min(1, 'Subject name is required'),
  marksObtained: z.coerce.number().min(0, 'Min 0').max(1000, 'Invalid marks'),
  maxMarks: z.coerce.number().min(1, 'Max marks required').max(1000, 'Invalid max marks'),
});

export const qualificationSchema = z.object({
  level: z.string().min(1, 'Select qualification level'),
  boardOrUniversity: z.string().min(1, 'Board or University is required'),
  institutionName: z.string().min(2, 'School or College name is required'),
  yearOfPassing: z.string().regex(/^(19|20)\d{2}$/, 'Valid 4-digit year required'),
  overallPercentage: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
  regulation: z.string().optional(),
  subjects: z.array(subjectSchema).min(1, 'Add at least one subject'),
});

export const applicationSchema = z.object({
  // Section A: Program Selection
  degreeLevel: z.enum(['UG', 'PG'], { required_error: 'Select UG or PG' }),
  preference1: z.string().min(1, '1st Preference course is required'),
  preference2: z.string().min(1, '2nd Preference course is required'),
  preference3: z.string().min(1, '3rd Preference course is required'),

  // Section B: Personal Details
  fullName: z.string().min(3, 'Full name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Select gender' }),
  nationality: z.string().min(2, 'Nationality is required'),
  religion: z.string().min(1, 'Religion is required'),
  community: z.string().min(1, 'Community is required'),
  caste: z.string().min(1, 'Caste/Sub-caste is required'),
  aadharNo: z.string().regex(/^\d{12}$/, 'Aadhar number must be 12 digits'),

  // Section C: Contact Details
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, '10-digit mobile number required'),
  email: z.string().email('Valid email required'),
  parentName: z.string().min(3, 'Parent/Guardian name is required'),
  parentMobile: z.string().regex(/^[6-9]\d{9}$/, 'Parent mobile number must be 10 digits'),

  // Section D: Dynamic Academic Qualifications
  qualifications: z.array(qualificationSchema).min(1, 'Add at least one academic qualification'),

  // Section E: Entrance/Counselling Details
  counsellingCode: z.string().default('1517'),
  tneaAppNo: z.string().optional(),
  entranceRank: z.string().optional(),

  // Section F: Documents (Uploaded status flags or files)
  doc10th: z.any().refine(val => !!val, '10th Marksheet is required'),
  doc12th: z.any().optional(),
  docUgDegree: z.any().optional(),
  docTransferCert: z.any().refine(val => !!val, 'Transfer Certificate is required'),
  docCommunityCert: z.any().optional(),
  docAadhar: z.any().refine(val => !!val, 'Aadhar Card copy is required'),
  docPhoto: z.any().refine(val => !!val, 'Passport Photo is required'),

  // Section G: Declaration
  declarationAgreed: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the declaration to submit' }),
  }),
});
