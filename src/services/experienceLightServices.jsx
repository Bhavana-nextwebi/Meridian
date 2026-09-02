import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/experience-light/add
// body (multipart/form-data): ExperienceGuid, Title, SubTitle, Description, MediaType, MediaUrl (file), DisplayOrder
export const addExperienceLight = async (formData) => {
  const response = await axiosInstance.post('experience-light/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-light/update
// body (multipart/form-data): Id, Title, SubTitle, Description, MediaType, MediaUrl (file), DisplayOrder
export const updateExperienceLight = async (formData) => {
  const response = await axiosInstance.put('experience-light/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-light/get-all
export const fetchAllExperienceLights = async () => {
  const response = await axiosInstance.get('experience-light/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/experience-light/get-by-id/{Id}
export const fetchExperienceLightById = async (id) => {
  const response = await axiosInstance.get(`experience-light/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-light/get-by-experience-guid/{experienceGuid}
export const fetchExperienceLightsByExperienceGuid = async (experienceGuid) => {
  const response = await axiosInstance.get(
    `experience-light/get-by-experience-guid/${experienceGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-light/delete/{Id}
export const deleteExperienceLight = async (id) => {
  const response = await axiosInstance.delete(`experience-light/delete/${id}`, { headers });
  return response.data;
};