import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-subcategory-event/add
export const addExperienceSubcategoryEvent = async (formData) => {
  const response = await axiosInstance.post('experience-subcategory-event/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory-event/update
export const updateExperienceSubcategoryEvent = async (formData) => {
  const response = await axiosInstance.put('experience-subcategory-event/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory-event/GetAllExperienceSubcategoryEvents
export const fetchAllExperienceSubcategoryEvents = async () => {
  const response = await axiosInstance.get('experience-subcategory-event/GetAllExperienceSubcategoryEvents', { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-event/GetExperienceSubcategoryEvent/{Id}
export const fetchExperienceSubcategoryEventById = async (id) => {
  const response = await axiosInstance.get(`experience-subcategory-event/GetExperienceSubcategoryEvent/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-event/GetByGuid/{experienceSubcategoryGuid}
export const fetchExperienceSubcategoryEventsByGuid = async (experienceSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `experience-subcategory-event/GetByGuid/${experienceSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory-event/delete/{Id}
export const deleteExperienceSubcategoryEvent = async (id) => {
  const response = await axiosInstance.delete(`experience-subcategory-event/delete/${id}`, { headers });
  return response.data;
};
