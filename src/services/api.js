import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create Axios Instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper to normalize user object from API responses
export function normalizeUser(rawData) {
  if (!rawData) return null;
  if (rawData.fullName && rawData.email && 'token' in rawData) {
    return rawData;
  }
  const userObj = rawData.data?.user || rawData.user || rawData.data || rawData;
  const token = rawData.data?.access_token || rawData.access_token || rawData.token || rawData.data?.token;
  return {
    id: userObj.id,
    fullName: userObj.name || userObj.fullName,
    email: userObj.email || userObj.mail,
    token: token || null,
    phone_number: userObj.phone_number || userObj.mobile_number,
  };
}

// Add request interceptor for JWT token injection when connecting to backend
apiClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('tec_user') || 'null');
  if (user) {
    const token = user.token || user.data?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Get Departments List Service
 * GET /institution/departments/list
 */
export async function getDepartmentsList() {
  const response = await apiClient.get('/institution/departments/list');
  return response.data?.data || response.data;
}

/**
 * Get Programs List Service
 * GET /institution/programs/list
 */
export async function getProgramsList() {
  const response = await apiClient.get('/institution/programs/list');
  return response.data?.data || response.data;
}

/**
 * Get Program Detail Service
 * GET /institution/programs/get/{id}
 */
export async function getProgramDetail(id) {
  const response = await apiClient.get(`/institution/programs/get/${id}`);
  return response.data?.data || response.data;
}

/**
 * Get Academic Years List Service
 * GET /institution/academic-years/list
 */
export async function getAcademicYearsList() {
  const response = await apiClient.get('/institution/academic-years/list');
  return response.data?.data || response.data;
}

/**
 * Get Dynamic Form Modules Service
 * GET /forms/modules/list
 */
export async function getFormModulesList() {
  const response = await apiClient.get('/forms/modules/list');
  return response.data?.data || response.data;
}

/**
 * Get Dynamic Form Fields Service
 * GET /forms/fields/list
 */
export async function getFormFieldsList() {
  const response = await apiClient.get('/forms/fields/list');
  return response.data?.data || response.data;
}

/**
 * Register User Service
 * POST /forms/users/create
 * Payload: { name, email, phone_number, password }
 */
export async function registerUser(payload) {
  const formattedPayload = {
    name: payload.name || payload.fullName,
    email: payload.email,
    phone_number: payload.phone_number || payload.mobile,
    password: payload.password,
  };
  const response = await apiClient.post('/forms/users/create', formattedPayload);
  const data = response.data;
  
  if (data) {
    const normalized = normalizeUser(data);
    localStorage.setItem('tec_user', JSON.stringify(normalized));
    return normalized;
  }
  return data;
}

/**
 * Login User Service
 * POST /forms/users/login
 * Payload: { email, password }
 */
export async function loginUser(payload) {
  const formattedPayload = {
    email: payload.email || payload.identifier,
    password: payload.password,
  };
  const response = await apiClient.post('/forms/users/login', formattedPayload);
  const data = response.data;
  
  if (data) {
    const normalized = normalizeUser(data);
    localStorage.setItem('tec_user', JSON.stringify(normalized));
    return normalized;
  }
  return data;
}

/**
 * Submit Application Service
 * POST /forms/applications/create
 */
export async function submitApplication(formData) {
  const response = await apiClient.post('/forms/applications/create', formData);
  localStorage.removeItem('tec_application_draft');
  return response.data;
}

/**
 * Get Application Status Service
 */
export async function getApplicationStatus(applicationId) {
  if (applicationId) {
    const response = await apiClient.get(`/forms/applications/get/${applicationId}`);
    return response.data;
  }
  const user = JSON.parse(localStorage.getItem('tec_user') || 'null');
  if (user && user.id) {
    const response = await apiClient.get(`/forms/applications/list?user_id=${user.id}`);
    return response.data;
  }
  return null;
}

/**
 * Upload Document Service
 */
export async function uploadDocument(file, docType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);
  const response = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Initiate Payment Service
 */
export async function initiatePayment(applicationId) {
  const response = await apiClient.post('/payments/initiate', { applicationId });
  return response.data;
}




