import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-card/add
// body (json): ExperienceGuid, Title, Subtitle, Description, DisplayOrder
export const addExperienceCard = async (data) => {
  const response = await axiosInstance.post('experience-card/add', data, { headers });
  return response.data;
};

// PUT /api/v1/experience-card/update
// body (json): Id, Title, Subtitle, Description, DisplayOrder
export const updateExperienceCard = async (data) => {
  const response = await axiosInstance.put('experience-card/update', data, { headers });
  return response.data;
};

// GET /api/v1/experience-card/GetAllExperienceCards
export const fetchAllExperienceCards = async () => {
  const response = await axiosInstance.get('experience-card/GetAllExperienceCards', { headers });
  return response.data.result;
};

// GET /api/v1/experience-card/GetExperienceCard/{Id}
export const fetchExperienceCardById = async (id) => {
  const response = await axiosInstance.get(`experience-card/GetExperienceCard/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-card/GetByGuid/{experienceGuid}
export const fetchExperienceCardsByExperienceGuid = async (experienceGuid) => {
  const response = await axiosInstance.get(
    `experience-card/GetByGuid/${experienceGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-card/delete/{Id}
export const deleteExperienceCard = async (id) => {
  const response = await axiosInstance.delete(`experience-card/delete/${id}`, { headers });
  return response.data;
};