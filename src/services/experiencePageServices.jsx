import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // NOTE: no 'Content-Type' header here on purpose - add/update send FormData
  // (multipart/form-data), and axios needs to set its own boundary for that.
};

// POST /api/v1/experience-page/add
// body (multipart/form-data): ExperienceCategoryId, ExperienceCategoryName,
// ExperienceSubcategoryId, ExperienceSubcategoryName, BannerTitle,
// BannerImage (file), Title, Description, Image (file), CtaTitle, CtaDescription
export const addExperiencePage = async (formData) => {
  const response = await axiosInstance.post('experience-page/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-page/update
// body (multipart/form-data): Id, ExperienceCategoryId, ExperienceCategoryName,
// ExperienceSubcategoryId, ExperienceSubcategoryName, BannerTitle,
// BannerImage (file), Title, Description, Image (file), CtaTitle, CtaDescription
export const updateExperiencePage = async (formData) => {
  const response = await axiosInstance.put('experience-page/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-page/get-all
export const fetchAllExperiencePages = async () => {
  const response = await axiosInstance.get('experience-page/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/experience-page/get-by-id/{Id}
export const fetchExperiencePageById = async (id) => {
  const response = await axiosInstance.get(`experience-page/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-page/get-by-guid/{experienceGuid}
export const fetchExperiencePageByGuid = async (experienceGuid) => {
  const response = await axiosInstance.get(`experience-page/get-by-guid/${experienceGuid}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/experience-page/delete/{Id}
export const deleteExperiencePage = async (id) => {
  const response = await axiosInstance.delete(`experience-page/delete/${id}`, { headers });
  return response.data;
};