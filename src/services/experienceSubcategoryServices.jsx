import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const authHeaders = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// Builds a multipart/form-data body matching the ExperienceSubcategory request schema:
// ExperienceCategoryId, ExperienceSubcategoryName, ExperienceSubcategoryUrl,
// ExperienceSubcategoryShortDesc, ExperienceSubcategoryImage (binary), DisplayOrder
const buildFormData = ({ experienceCategoryId, experienceSubcategoryName, experienceSubcategoryUrl, experienceSubcategoryShortDesc, experienceSubcategoryImage, displayOrder }) => {
  const formData = new FormData();
  formData.append('ExperienceCategoryId', experienceCategoryId ?? '');
  formData.append('ExperienceSubcategoryName', experienceSubcategoryName ?? '');
  formData.append('ExperienceSubcategoryUrl', experienceSubcategoryUrl ?? '');
  formData.append('ExperienceSubcategoryShortDesc', experienceSubcategoryShortDesc ?? '');
  formData.append('DisplayOrder', displayOrder ?? 0);

  // Only append the image if one was actually selected; otherwise let the
  // "Send empty value" behavior be handled server-side (e.g. keep existing image on update).
  if (experienceSubcategoryImage) {
    formData.append('ExperienceSubcategoryImage', experienceSubcategoryImage);
  }

  return formData;
};

// POST /api/v1/experience-subcategory/add
// multipart body: { ExperienceCategoryId, ExperienceSubcategoryName, ExperienceSubcategoryUrl, ExperienceSubcategoryShortDesc, ExperienceSubcategoryImage, DisplayOrder }
export const createExperienceSubcategory = async ({ experienceCategoryId, experienceSubcategoryName, experienceSubcategoryUrl, experienceSubcategoryShortDesc, experienceSubcategoryImage, displayOrder }) => {
  const formData = buildFormData({ experienceCategoryId, experienceSubcategoryName, experienceSubcategoryUrl, experienceSubcategoryShortDesc, experienceSubcategoryImage, displayOrder });
  const response = await axiosInstance.post('experience-subcategory/add', formData, {
    headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// PUT /api/v1/experience-subcategory/update
// multipart body: { Id, ExperienceCategoryId, ExperienceSubcategoryName, ExperienceSubcategoryUrl, ExperienceSubcategoryShortDesc, ExperienceSubcategoryImage, DisplayOrder }
export const updateExperienceSubcategory = async ({ id, experienceCategoryId, experienceSubcategoryName, experienceSubcategoryUrl, experienceSubcategoryShortDesc, experienceSubcategoryImage, displayOrder }) => {
  const formData = buildFormData({ experienceCategoryId, experienceSubcategoryName, experienceSubcategoryUrl, experienceSubcategoryShortDesc, experienceSubcategoryImage, displayOrder });
  formData.append('Id', id);
  const response = await axiosInstance.put('experience-subcategory/update', formData, {
    headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// GET /api/v1/experience-subcategory/GetAllExperienceSubcategories
// returns: { result: [{ id, experienceCategoryId, experienceSubcategoryName, experienceSubcategoryUrl, experienceSubcategoryShortDesc, experienceSubcategoryImage, displayOrder, addedOn, addedIp, status }], isSuccess, message, responseCode }
export const fetchExperienceSubcategories = async () => {
  const response = await axiosInstance.get('experience-subcategory/GetAllExperienceSubcategories', {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data.result;
};

// GET /api/v1/experience-subcategory/GetExperienceSubcategory/{Id}
export const fetchExperienceSubcategoryById = async (id) => {
  const response = await axiosInstance.get(`experience-subcategory/GetExperienceSubcategory/${id}`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data.result;
};

// GET /api/v1/experience-subcategory/GetByCategoryId/{experienceCategoryId}
export const fetchExperienceSubcategoriesByCategoryId = async (experienceCategoryId) => {
  const response = await axiosInstance.get(`experience-subcategory/GetByCategoryId/${experienceCategoryId}`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory/delete/{Id}
export const deleteExperienceSubcategory = async (id) => {
  const response = await axiosInstance.delete(`experience-subcategory/delete/${id}`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data;
};