import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// POST /api/v1/experience-category/add
// body: { experienceCategoryName: string, displayOrder: number }
export const createExperienceCategory = async (experienceCategoryName, displayOrder) => {
  const response = await axiosInstance.post('experience-category/add', { experienceCategoryName, displayOrder }, { headers });
  return response.data;
};

// PUT /api/v1/experience-category/update
// body: { id: number, experienceCategoryName: string, displayOrder: number }
export const updateExperienceCategory = async (payload) => {
  const response = await axiosInstance.put('experience-category/update', payload, { headers });
  return response.data;
};

// GET /api/v1/experience-category/get-all
// returns: { result: [{ id, experienceCategoryName, displayOrder, addedOn, addedIp, status }], isSuccess, message, responseCode }
export const fetchExperienceCategories = async () => {
  const response = await axiosInstance.get('experience-category/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/experience-category/get-by-id/{Id}
export const fetchExperienceCategoryById = async (id) => {
  const response = await axiosInstance.get(`experience-category/get-by-id/${id}`, { headers });
  return response.data.result;
};

// NOTE: no delete endpoint was provided in the spec. Assuming it follows the same
// naming convention as the other endpoints (mirrors album-category's delete route).
// Update the path below once the actual delete endpoint is confirmed.
export const deleteExperienceCategory = async (id) => {
  const response = await axiosInstance.delete(`experience-category/delete/${id}`, { headers });
  return response.data;
};