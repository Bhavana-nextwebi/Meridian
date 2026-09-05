import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-subcategory-light/add
export const addExperienceSubcategoryLight = async (formData) => {
  const response = await axiosInstance.post('experience-subcategory-light/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory-light/update
export const updateExperienceSubcategoryLight = async (formData) => {
  const response = await axiosInstance.put('experience-subcategory-light/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory-light/GetAllExperienceSubcategoryLights
export const fetchAllExperienceSubcategoryLights = async () => {
  const response = await axiosInstance.get('experience-subcategory-light/GetAllExperienceSubcategoryLights', { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-light/GetExperienceSubcategoryLight/{Id}
export const fetchExperienceSubcategoryLightById = async (id) => {
  const response = await axiosInstance.get(`experience-subcategory-light/GetExperienceSubcategoryLight/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-light/GetByGuid/{experienceSubcategoryGuid}
export const fetchExperienceSubcategoryLightsByGuid = async (experienceSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `experience-subcategory-light/GetByGuid/${experienceSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory-light/delete/{Id}
export const deleteExperienceSubcategoryLight = async (id) => {
  const response = await axiosInstance.delete(`experience-subcategory-light/delete/${id}`, { headers });
  return response.data;
};
