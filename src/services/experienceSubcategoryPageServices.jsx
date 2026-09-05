import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // NOTE: no 'Content-Type' header here on purpose - add/update send FormData
  // (multipart/form-data), and axios needs to set its own boundary for that.
};

// POST /api/v1/experience-subcategory-page/add
export const addExperienceSubcategoryPage = async (formData) => {
  const response = await axiosInstance.post('experience-subcategory-page/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory-page/update
export const updateExperienceSubcategoryPage = async (formData) => {
  const response = await axiosInstance.put('experience-subcategory-page/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory-page/GetAllExperienceSubcategoryPages
export const fetchAllExperienceSubcategoryPages = async () => {
  const response = await axiosInstance.get('experience-subcategory-page/GetAllExperienceSubcategoryPages', { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-page/GetExperienceSubcategoryPage/{Id}
export const fetchExperienceSubcategoryPageById = async (id) => {
  const response = await axiosInstance.get(`experience-subcategory-page/GetExperienceSubcategoryPage/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-page/GetBySubcategoryId/{experienceSubcategoryId}
export const fetchExperienceSubcategoryPageBySubcategoryId = async (experienceSubcategoryId) => {
  const response = await axiosInstance.get(
    `experience-subcategory-page/GetBySubcategoryId/${experienceSubcategoryId}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/experience-subcategory-page/GetByGuid/{experienceSubcategoryGuid}
export const fetchExperienceSubcategoryPageByGuid = async (experienceSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `experience-subcategory-page/GetByGuid/${experienceSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory-page/delete/{Id}
export const deleteExperienceSubcategoryPage = async (id) => {
  const response = await axiosInstance.delete(`experience-subcategory-page/delete/${id}`, { headers });
  return response.data;
};
