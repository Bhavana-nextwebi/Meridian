import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/experience-event/add
// body (multipart/form-data): ExperienceGuid, Title, Description, Image (file), DisplayOrder
export const addExperienceEvent = async (formData) => {
  const response = await axiosInstance.post('experience-event/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-event/update
// body (multipart/form-data): Id, Title, Description, Image (file), DisplayOrder
export const updateExperienceEvent = async (formData) => {
  const response = await axiosInstance.put('experience-event/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-event/get-all
export const fetchAllExperienceEvents = async () => {
  const response = await axiosInstance.get('experience-event/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/experience-event/get-by-id/{Id}
export const fetchExperienceEventById = async (id) => {
  const response = await axiosInstance.get(`experience-event/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-event/get-by-experience-guid/{experienceGuid}
export const fetchExperienceEventsByExperienceGuid = async (experienceGuid) => {
  const response = await axiosInstance.get(
    `experience-event/get-by-experience-guid/${experienceGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-event/delete/{Id}
export const deleteExperienceEvent = async (id) => {
  const response = await axiosInstance.delete(`experience-event/delete/${id}`, { headers });
  return response.data;
};