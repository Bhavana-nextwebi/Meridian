

import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-faq/add
// body (json): ExperienceGuid, Question, Answer, DisplayOrder
export const addExperienceFaq = async (data) => {
  const response = await axiosInstance.post('experience-faq/add', data, { headers });
  return response.data;
};

// PUT /api/v1/experience-faq/update
// body (json): Id, Question, Answer, DisplayOrder
export const updateExperienceFaq = async (data) => {
  const response = await axiosInstance.put('experience-faq/update', data, { headers });
  return response.data;
};

// GET /api/v1/experience-faq/GetAllExperienceFaqs
export const fetchAllExperienceFaqs = async () => {
  const response = await axiosInstance.get('experience-faq/GetAllExperienceFaqs', { headers });
  return response.data.result;
};

// GET /api/v1/experience-faq/GetExperienceFaq/{Id}
export const fetchExperienceFaqById = async (id) => {
  const response = await axiosInstance.get(`experience-faq/GetExperienceFaq/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-faq/GetByGuid/{experienceGuid}
export const fetchExperienceFaqsByExperienceGuid = async (experienceGuid) => {
  const response = await axiosInstance.get(
    `experience-faq/GetByGuid/${experienceGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-faq/delete/{Id}
export const deleteExperienceFaq = async (id) => {
  const response = await axiosInstance.delete(`experience-faq/delete/${id}`, { headers });
  return response.data;
};