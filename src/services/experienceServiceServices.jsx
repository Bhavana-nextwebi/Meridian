import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/experience-service/add
// body (multipart/form-data): ExperienceGuid, ServiceTitle, ServiceDesc, ServiceIcon (file), DisplayOrder
export const addExperienceService = async (formData) => {
  const response = await axiosInstance.post('experience-service/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-service/update
// body (multipart/form-data): Id, ServiceTitle, ServiceDesc, ServiceIcon (file), DisplayOrder
export const updateExperienceService = async (formData) => {
  const response = await axiosInstance.put('experience-service/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-service/get-all
export const fetchAllExperienceServices = async () => {
  const response = await axiosInstance.get('experience-service/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/experience-service/get-by-id/{Id}
export const fetchExperienceServiceById = async (id) => {
  const response = await axiosInstance.get(`experience-service/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-service/get-by-experience-guid/{experienceGuid}
export const fetchExperienceServicesByExperienceGuid = async (experienceGuid) => {
  const response = await axiosInstance.get(
    `experience-service/get-by-experience-guid/${experienceGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-service/delete/{Id}s
export const deleteExperienceService = async (id) => {
  const response = await axiosInstance.delete(`experience-service/delete/${id}`, { headers });
  return response.data;
};