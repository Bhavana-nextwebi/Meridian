import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// POST /api/v1/experience-subcategory/add
// body: { experienceCategoryId: number, experienceSubcategoryName: string, displayOrder: number }
export const createExperienceSubcategory = async (experienceCategoryId, experienceSubcategoryName, displayOrder) => {
  const response = await axiosInstance.post('experience-subcategory/add', { experienceCategoryId, experienceSubcategoryName, displayOrder }, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory/update
// body: { id: number, experienceSubcategoryName: string, displayOrder: number }
export const updateExperienceSubcategory = async (payload) => {
  const response = await axiosInstance.put('experience-subcategory/update', payload, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory/GetAllExperienceSubcategories
// returns: { result: [{ id, experienceCategoryId, experienceSubcategoryName, displayOrder, addedOn, addedIp, status }], isSuccess, message, responseCode }
export const fetchExperienceSubcategories = async () => {
  const response = await axiosInstance.get('experience-subcategory/GetAllExperienceSubcategories', { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory/GetExperienceSubcategory/{Id}
export const fetchExperienceSubcategoryById = async (id) => {
  const response = await axiosInstance.get(`experience-subcategory/GetExperienceSubcategory/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory/GetByCategoryId/{experienceCategoryId}
export const fetchExperienceSubcategoriesByCategoryId = async (experienceCategoryId) => {
  const response = await axiosInstance.get(`experience-subcategory/GetByCategoryId/${experienceCategoryId}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory/delete/{Id}
export const deleteExperienceSubcategory = async (id) => {
  const response = await axiosInstance.delete(`experience-subcategory/delete/${id}`, { headers });
  return response.data;
};
