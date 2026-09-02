import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/experience-wedding/add
// body (multipart/form-data): ExperienceGuid, Title, Image (file), DisplayOrder
export const addExperienceWedding = async (formData) => {
  const response = await axiosInstance.post('experience-wedding/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-wedding/update
// body (multipart/form-data): Id, Title, Image (file), DisplayOrder
export const updateExperienceWedding = async (formData) => {
  const response = await axiosInstance.put('experience-wedding/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-wedding/get-all
export const fetchAllExperienceWeddings = async () => {
  const response = await axiosInstance.get('experience-wedding/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/experience-wedding/get-by-id/{Id}
export const fetchExperienceWeddingById = async (id) => {
  const response = await axiosInstance.get(`experience-wedding/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-wedding/get-by-experience-guid/{experienceGuid}
export const fetchExperienceWeddingsByExperienceGuid = async (experienceGuid) => {
  const response = await axiosInstance.get(
    `experience-wedding/get-by-experience-guid/${experienceGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-wedding/delete/{Id}
export const deleteExperienceWedding = async (id) => {
  const response = await axiosInstance.delete(`experience-wedding/delete/${id}`, { headers });
  return response.data;
};