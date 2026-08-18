import { axiosInstance } from './axiosInstance';

/**
 * Submit Application Service
 * POST /forms/applications/create
 * 
 * @param {Object} payload - { program_id, form_data }
 * @returns {Promise<Object>} Backend response JSON { code, message, data: { id, candidate_id, program_id, application_no, form_data } }
 */
export async function createApplication(payload) {
  const response = await axiosInstance.post('/forms/applications/create', payload);
  return response.data;
}

/**
 * Alias for backward compatibility
 */
export const submitApplication = createApplication;

/**
 * Get Candidate Applications / Status Service
 * GET /forms/applications/list or GET /forms/applications/get/{id}
 * 
 * @param {string|number} [applicationId] Optional application ID
 * @returns {Promise<Object>} Application status or list
 */
export async function getApplicationStatus(applicationId) {
  if (applicationId) {
    const response = await axiosInstance.get(`/forms/applications/get/${applicationId}`);
    return response.data;
  }

  const storedUser = localStorage.getItem('tec_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.id) {
        const response = await axiosInstance.get(`/forms/applications/list?user_id=${user.id}`);
        return response.data;
      }
    } catch (e) {
      console.error('Failed to parse user in getApplicationStatus:', e);
    }
  }

  return null;
}

/**
 * Get My Applications (alias for tracking view)
 */
export async function getMyApplications() {
  return getApplicationStatus();
}

/**
 * Initiate Application Fee Payment Service
 * POST /payments/initiate
 */
export async function initiatePayment(applicationId) {
  const response = await axiosInstance.post('/payments/initiate', { applicationId });
  return response.data;
}

/**
 * Download Application PDF Document from Backend
 * GET /forms/applications/download-pdf/{id}
 */
export async function downloadApplicationPDF(applicationId) {
  const response = await axiosInstance.get(`/forms/applications/download-pdf/${applicationId}`, {
    responseType: 'blob',
  });
  return response.data;
}
