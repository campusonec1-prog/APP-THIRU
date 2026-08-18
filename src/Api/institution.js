import { axiosInstance } from './axiosInstance';

/**
 * Get Departments List Service
 * GET /institution/departments/list
 */
export async function getDepartmentsList() {
  const response = await axiosInstance.get('/institution/departments/list?is_display=true&pagination=false');
  return response.data?.data || response.data;
}

/**
 * Get Programs List Service
 * GET /institution/programs/list
 */
export async function getProgramsList() {
  const response = await axiosInstance.get('/institution/programs/list?pagination=false');
  return response.data?.data || response.data;
}

/**
 * Get Program Detail Service
 * GET /institution/programs/get/{id}
 */
export async function getProgramDetail(id) {
  const response = await axiosInstance.get(`/institution/programs/get/${id}`);
  return response.data?.data || response.data;
}

/**
 * Get Academic Years List Service
 * GET /institution/academic-years/list
 */
export async function getAcademicYearsList() {
  const response = await axiosInstance.get('/institution/academic-years/list');
  return response.data?.data || response.data;
}

/**
 * Get Dynamic Form Modules Service
 * GET /forms/modules/list
 */
export async function getFormModulesList() {
  const response = await axiosInstance.get('/forms/modules/list?pagination=false');
  return response.data?.data || response.data;
}

/**
 * Get Dynamic Form Fields Service
 * GET /forms/fields/list
 */
export async function getFormFieldsList() {
  const response = await axiosInstance.get('/forms/fields/list?pagination=false');
  return response.data?.data || response.data;
}

/**
 * Get College Headers List Service
 * GET /institution/college-headers/list
 */
export async function getCollegeHeadersList() {
  const response = await axiosInstance.get('/institution/college-headers/list');
  return response.data?.data || response.data;
}
