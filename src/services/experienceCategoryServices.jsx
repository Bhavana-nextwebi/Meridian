import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const authHeaders = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// Builds a multipart/form-data body matching the ExperienceCategory request schema:
// ExperienceCategoryName, ExperienceCategoryUrl, ExperienceCategoryShortDesc,
// ExperienceCategoryImage (binary), DisplayOrder
const buildFormData = ({ experienceCategoryName, experienceCategoryUrl, experienceCategoryShortDesc, experienceCategoryImage, displayOrder }) => {
  const formData = new FormData();
  formData.append('ExperienceCategoryName', experienceCategoryName ?? '');
  formData.append('ExperienceCategoryUrl', experienceCategoryUrl ?? '');
  formData.append('ExperienceCategoryShortDesc', experienceCategoryShortDesc ?? '');
  formData.append('DisplayOrder', displayOrder ?? 0);

  // Only append the image if one was actually selected; otherwise let the
  // "Send empty value" behavior be handled server-side (e.g. keep existing image on update).
  if (experienceCategoryImage) {
    formData.append('ExperienceCategoryImage', experienceCategoryImage);
  }

  return formData;
};

// POST /api/v1/experience-category/add
// multipart body: { ExperienceCategoryName, ExperienceCategoryUrl, ExperienceCategoryShortDesc, ExperienceCategoryImage, DisplayOrder }
export const createExperienceCategory = async ({ experienceCategoryName, experienceCategoryUrl, experienceCategoryShortDesc, experienceCategoryImage, displayOrder }) => {
  const formData = buildFormData({ experienceCategoryName, experienceCategoryUrl, experienceCategoryShortDesc, experienceCategoryImage, displayOrder });
  const response = await axiosInstance.post('experience-category/add', formData, {
    headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// PUT /api/v1/experience-category/update
// multipart body: { Id, ExperienceCategoryName, ExperienceCategoryUrl, ExperienceCategoryShortDesc, ExperienceCategoryImage, DisplayOrder }
export const updateExperienceCategory = async ({ id, experienceCategoryName, experienceCategoryUrl, experienceCategoryShortDesc, experienceCategoryImage, displayOrder }) => {
  const formData = buildFormData({ experienceCategoryName, experienceCategoryUrl, experienceCategoryShortDesc, experienceCategoryImage, displayOrder });
  formData.append('Id', id);
  const response = await axiosInstance.put('experience-category/update', formData, {
    headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// GET /api/v1/experience-category/get-all
// returns: { result: [{ id, experienceCategoryName, experienceCategoryUrl, experienceCategoryShortDesc, experienceCategoryImage, displayOrder, addedOn, addedIp, status }], isSuccess, message, responseCode }
export const fetchExperienceCategories = async () => {
  const response = await axiosInstance.get('experience-category/get-all', {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data.result;
};

// GET /api/v1/experience-category/get-by-id/{Id}
export const fetchExperienceCategoryById = async (id) => {
  const response = await axiosInstance.get(`experience-category/get-by-id/${id}`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data.result;
};

// NOTE: no delete endpoint was provided in the spec. Assuming it follows the same
// naming convention as the other endpoints (mirrors album-category's delete route).
// Update the path below once the actual delete endpoint is confirmed.
export const deleteExperienceCategory = async (id) => {
  const response = await axiosInstance.delete(`experience-category/delete/${id}`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data;
};