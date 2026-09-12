import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const authHeaders = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// Builds a multipart/form-data body matching the VenueCategory request schema:
// VenueCategoryName, VenueCategoryUrl, VenueCategoryShortDesc,
// VenueCategoryImage (binary), DisplayOrder
const buildFormData = ({ venueCategoryName, venueCategoryUrl, venueCategoryShortDesc, venueCategoryImage, displayOrder }) => {
  const formData = new FormData();
  formData.append('VenueCategoryName', venueCategoryName ?? '');
  formData.append('VenueCategoryUrl', venueCategoryUrl ?? '');
  formData.append('VenueCategoryShortDesc', venueCategoryShortDesc ?? '');
  formData.append('DisplayOrder', displayOrder ?? 0);

  // Only append the image if one was actually selected; otherwise let the
  // "Send empty value" behavior be handled server-side (e.g. keep existing image on update).
  if (venueCategoryImage) {
    formData.append('VenueCategoryImage', venueCategoryImage);
  }

  return formData;
};

// POST /api/v1/venue-category/add
// multipart body: { VenueCategoryName, VenueCategoryUrl, VenueCategoryShortDesc, VenueCategoryImage, DisplayOrder }
export const createVenueCategory = async ({ venueCategoryName, venueCategoryUrl, venueCategoryShortDesc, venueCategoryImage, displayOrder }) => {
  const formData = buildFormData({ venueCategoryName, venueCategoryUrl, venueCategoryShortDesc, venueCategoryImage, displayOrder });
  const response = await axiosInstance.post('venue-category/add', formData, {
    headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// PUT /api/v1/venue-category/update
// multipart body: { Id, VenueCategoryName, VenueCategoryUrl, VenueCategoryShortDesc, VenueCategoryImage, DisplayOrder }
export const updateVenueCategory = async ({ id, venueCategoryName, venueCategoryUrl, venueCategoryShortDesc, venueCategoryImage, displayOrder }) => {
  const formData = buildFormData({ venueCategoryName, venueCategoryUrl, venueCategoryShortDesc, venueCategoryImage, displayOrder });
  formData.append('Id', id);
  const response = await axiosInstance.put('venue-category/update', formData, {
    headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// GET /api/v1/venue-category/get-all
// returns: { result: [{ id, venueCategoryName, venueCategoryUrl, venueCategoryShortDesc, venueCategoryImage, displayOrder, addedOn, addedIp, status }], isSuccess, message, responseCode }
export const fetchVenueCategories = async () => {
  const response = await axiosInstance.get('venue-category/get-all', {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data.result;
};

// GET /api/v1/venue-category/get-by-id/{Id}
export const fetchVenueCategoryById = async (id) => {
  const response = await axiosInstance.get(`venue-category/get-by-id/${id}`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data.result;
};

// DELETE /api/v1/venue-category/delete/{Id}
export const deleteVenueCategory = async (id) => {
  const response = await axiosInstance.delete(`venue-category/delete/${id}`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
  });
  return response.data;
};