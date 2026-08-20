import { axiosInstance } from './axiosInstance';

/**
 * Upload Documents Service
 * POST /documents/upload
 * 
 * @param {FormData} formData - Multipart Form-Data payload containing `docType` and file entries
 * @param {Function} [onProgress] - Optional callback for upload progress (0 to 100)
 * @returns {Promise<Object>} Backend response JSON
 */
export async function uploadDocuments(formData, onProgress) {
  const response = await axiosInstance.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 5 minutes specifically for file uploads
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
}

/**
 * Alias for legacy upload call with individual file + docType
 */
export async function uploadDocument(file, docType = 'application_documents', onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);
  return uploadDocuments(formData, onProgress);
}
