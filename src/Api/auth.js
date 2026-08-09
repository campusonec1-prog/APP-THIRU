import { axiosInstance } from './axiosInstance';

/**
 * Helper to normalize user object from API responses
 */
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

/**
 * Register User Service
 * POST /forms/users/create
 */
export async function registerUser(payload) {
  const formattedPayload = {
    name: payload.name || payload.fullName,
    email: payload.email,
    phone_number: payload.phone_number || payload.mobile,
    password: payload.password,
  };
  const response = await axiosInstance.post('/forms/users/create', formattedPayload);
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
 */
export async function loginUser(payload) {
  const formattedPayload = {
    email: payload.email || payload.identifier,
    password: payload.password,
  };
  const response = await axiosInstance.post('/forms/users/login', formattedPayload);
  const data = response.data;
  
  if (data) {
    const normalized = normalizeUser(data);
    localStorage.setItem('tec_user', JSON.stringify(normalized));
    return normalized;
  }
  return data;
}
