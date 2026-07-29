import axios from 'axios';
import { INITIAL_MOCK_USER, INITIAL_MOCK_APPLICATION } from './mockData';

// Configuration flag for toggling real REST API vs Mock fallback
const USE_MOCK_API = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.thirumalaiengg.org/v1';

// Create Axios Instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor for JWT token injection when connecting to backend
apiClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('tec_user') || 'null');
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Helper for simulating async API delay
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Register User Service
 * @param {Object} payload { fullName, mobile, email, password }
 */
export async function registerUser(payload) {
  if (!USE_MOCK_API) {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  }

  await delay(700);
  const user = {
    id: `usr_${Date.now()}`,
    fullName: payload.fullName,
    email: payload.email,
    mobile: payload.mobile,
    token: `tec-jwt-${Date.now()}`,
  };

  localStorage.setItem('tec_registered_user', JSON.stringify(user));
  return {
    success: true,
    message: 'Registration successful! Verification code sent.',
    user,
  };
}

/**
 * Send OTP Service
 * @param {string} mobile 
 */
export async function sendOtp(mobile) {
  if (!USE_MOCK_API) {
    const response = await apiClient.post('/auth/send-otp', { mobile });
    return response.data;
  }

  await delay(500);
  return {
    success: true,
    message: `OTP sent successfully to +91 ${mobile}`,
    otpHint: '123456', // Simulated fixed OTP for easy test flow
  };
}

/**
 * Verify OTP Service
 * @param {string} mobile 
 * @param {string} otp 
 */
export async function verifyOtp(mobile, otp) {
  if (!USE_MOCK_API) {
    const response = await apiClient.post('/auth/verify-otp', { mobile, otp });
    return response.data;
  }

  await delay(500);
  if (otp === '123456' || otp === '999999') {
    return {
      success: true,
      message: 'Mobile number verified successfully!',
    };
  }
  
  throw new Error('Invalid OTP code. Please enter 123456 for testing.');
}

/**
 * Login User Service
 * @param {Object} payload { identifier, password, otpLogin }
 */
export async function loginUser(payload) {
  if (!USE_MOCK_API) {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  }

  await delay(600);
  const savedReg = JSON.parse(localStorage.getItem('tec_registered_user') || 'null');
  
  const user = savedReg || {
    ...INITIAL_MOCK_USER,
    mobile: payload.identifier || INITIAL_MOCK_USER.mobile,
    email: payload.identifier.includes('@') ? payload.identifier : INITIAL_MOCK_USER.email,
  };

  localStorage.setItem('tec_user', JSON.stringify(user));

  return {
    success: true,
    message: 'Login successful!',
    user,
    token: user.token,
  };
}

/**
 * Submit Application Service
 * @param {Object} formData 
 */
export async function submitApplication(formData) {
  if (!USE_MOCK_API) {
    const response = await apiClient.post('/applications/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  await delay(900);
  
  // Calculate cut-off score if marks present
  const math = parseFloat(formData.mathsMarks) || 0;
  const phy = parseFloat(formData.physicsMarks) || 0;
  const chem = parseFloat(formData.chemistryMarks) || 0;
  const cutoffScore = (math + phy / 2 + chem / 2).toFixed(2);

  const applicationRecord = {
    applicationId: `TEC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
    feePaid: false,
    amount: 500,
    personalDetails: {
      fullName: formData.fullName,
      dob: formData.dob,
      gender: formData.gender,
      nationality: formData.nationality,
      religion: formData.religion,
      community: formData.community,
      caste: formData.caste,
      aadharNo: formData.aadharNo,
    },
    contactDetails: {
      address: formData.address,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
      mobile: formData.mobile,
      email: formData.email,
      parentName: formData.parentName,
      parentMobile: formData.parentMobile,
    },
    academicDetails: {
      tenthBoard: formData.tenthBoard,
      tenthSchool: formData.tenthSchool,
      tenthYear: formData.tenthYear,
      tenthPercentage: formData.tenthPercentage,
      twelfthBoard: formData.twelfthBoard,
      twelfthSchool: formData.twelfthSchool,
      twelfthYear: formData.twelfthYear,
      twelfthPercentage: formData.twelfthPercentage,
      physicsMarks: phy,
      chemistryMarks: chem,
      mathsMarks: math,
      cutoffScore: Number(cutoffScore),
      isDiplomaApplicant: formData.isDiplomaApplicant,
      diplomaStream: formData.diplomaStream,
      diplomaPercentage: formData.diplomaPercentage,
    },
    programSelection: {
      degreeLevel: formData.degreeLevel,
      preference1: formData.preference1,
      preference2: formData.preference2,
      preference3: formData.preference3,
    },
    entranceDetails: {
      counsellingCode: '1517',
      tneaAppNo: formData.tneaAppNo || 'TNEA2026-APPLY',
      entranceRank: formData.entranceRank || 'N/A',
    },
    documents: {
      doc10th: { name: formData.doc10th?.name || '10th_Marksheet.pdf' },
      doc12th: { name: formData.doc12th?.name || '12th_Marksheet.pdf' },
      docTransferCert: { name: formData.docTransferCert?.name || 'TC.pdf' },
      docCommunityCert: formData.docCommunityCert ? { name: formData.docCommunityCert.name } : null,
      docAadhar: { name: formData.docAadhar?.name || 'Aadhar.pdf' },
      docPhoto: { name: formData.docPhoto?.name || 'Photo.jpg' },
    }
  };

  localStorage.setItem('tec_application', JSON.stringify(applicationRecord));
  // Clear draft on successful submit
  localStorage.removeItem('tec_application_draft');

  return {
    success: true,
    message: 'Application submitted successfully!',
    application: applicationRecord,
  };
}

/**
 * Get Application Status Service
 * @param {string} [applicationId] 
 */
export async function getApplicationStatus(applicationId) {
  if (!USE_MOCK_API) {
    const response = await apiClient.get(`/applications/status/${applicationId}`);
    return response.data;
  }

  await delay(400);
  const savedApp = JSON.parse(localStorage.getItem('tec_application') || 'null');
  
  if (savedApp) {
    return {
      success: true,
      application: savedApp,
    };
  }

  // Return default mock if nothing submitted yet
  return {
    success: true,
    application: INITIAL_MOCK_APPLICATION,
  };
}

/**
 * Update Application Mock Status (For testing workflow states)
 */
export async function updateMockStatus(newStatus) {
  await delay(300);
  let savedApp = JSON.parse(localStorage.getItem('tec_application') || 'null');
  if (!savedApp) {
    savedApp = { ...INITIAL_MOCK_APPLICATION };
  }
  savedApp.status = newStatus;
  localStorage.setItem('tec_application', JSON.stringify(savedApp));
  return { success: true, application: savedApp };
}

/**
 * Upload Document Service
 * @param {File} file 
 * @param {string} docType 
 */
export async function uploadDocument(file, docType) {
  if (!USE_MOCK_API) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    const response = await apiClient.post('/documents/upload', formData);
    return response.data;
  }

  await delay(500);
  return {
    success: true,
    fileId: `doc_${Date.now()}`,
    docType,
    fileName: file.name,
    fileSize: file.size,
    url: URL.createObjectURL(file),
  };
}

/**
 * Initiate Payment Service
 * @param {string} applicationId 
 */
export async function initiatePayment(applicationId) {
  if (!USE_MOCK_API) {
    const response = await apiClient.post('/payments/initiate', { applicationId });
    return response.data;
  }

  await delay(800);
  const savedApp = JSON.parse(localStorage.getItem('tec_application') || 'null') || INITIAL_MOCK_APPLICATION;
  savedApp.feePaid = true;
  savedApp.paymentDetails = {
    txnId: `TXN_TEC_${Date.now()}`,
    paidAt: new Date().toISOString(),
    amount: 500,
    status: 'SUCCESS',
  };

  localStorage.setItem('tec_application', JSON.stringify(savedApp));

  return {
    success: true,
    message: 'Payment of ₹500 completed successfully!',
    payment: savedApp.paymentDetails,
  };
}

/**
 * Draft Save / Load Helpers for Local Storage Persistence
 */
export function saveDraft(data) {
  localStorage.setItem('tec_application_draft', JSON.stringify({
    data,
    savedAt: new Date().toISOString(),
  }));
}

export function getSavedDraft() {
  const raw = localStorage.getItem('tec_application_draft');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
