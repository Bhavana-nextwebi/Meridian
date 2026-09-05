import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-subcategory-wedding/add
export const addExperienceSubcategoryWedding = async (formData) => {
  const response = await axiosInstance.post('experience-subcategory-wedding/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory-wedding/update
export const updateExperienceSubcategoryWedding = async (formData) => {
  const response = await axiosInstance.put('experience-subcategory-wedding/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory-wedding/GetAllExperienceSubcategoryWeddings
export const fetchAllExperienceSubcategoryWeddings = async () => {
  const response = await axiosInstance.get('experience-subcategory-wedding/GetAllExperienceSubcategoryWeddings', { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-wedding/GetExperienceSubcategoryWedding/{Id}
export const fetchExperienceSubcategoryWeddingById = async (id) => {
  const response = await axiosInstance.get(`experience-subcategory-wedding/GetExperienceSubcategoryWedding/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-wedding/GetByGuid/{experienceSubcategoryGuid}
export const fetchExperienceSubcategoryWeddingsByGuid = async (experienceSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `experience-subcategory-wedding/GetByGuid/${experienceSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory-wedding/delete/{Id}
export const deleteExperienceSubcategoryWedding = async (id) => {
  const response = await axiosInstance.delete(`experience-subcategory-wedding/delete/${id}`, { headers });
  return response.data;
};
