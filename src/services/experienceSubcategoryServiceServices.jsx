import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-subcategory-service/add
export const addExperienceSubcategoryService = async (formData) => {
  const response = await axiosInstance.post('experience-subcategory-service/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory-service/update
export const updateExperienceSubcategoryService = async (formData) => {
  const response = await axiosInstance.put('experience-subcategory-service/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory-service/GetAllExperienceSubcategoryServices
export const fetchAllExperienceSubcategoryServices = async () => {
  const response = await axiosInstance.get('experience-subcategory-service/GetAllExperienceSubcategoryServices', { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-service/GetExperienceSubcategoryService/{Id}
export const fetchExperienceSubcategoryServiceById = async (id) => {
  const response = await axiosInstance.get(`experience-subcategory-service/GetExperienceSubcategoryService/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-service/GetByGuid/{experienceSubcategoryGuid}
export const fetchExperienceSubcategoryServicesByGuid = async (experienceSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `experience-subcategory-service/GetByGuid/${experienceSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory-service/delete/{Id}
export const deleteExperienceSubcategoryService = async (id) => {
  const response = await axiosInstance.delete(`experience-subcategory-service/delete/${id}`, { headers });
  return response.data;
};
