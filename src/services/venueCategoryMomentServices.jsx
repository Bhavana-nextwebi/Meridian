import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
};

const multipartHeaders = {
  ...headers,
  'Content-Type': 'multipart/form-data',
};

// POST /api/v1/venue-category-moment/add
// body (multipart/form-data): VenueCategoryGuid, Title, Image, DisplayOrder
export const addVenueCategoryMoment = async (formData) => {
  const response = await axiosInstance.post('venue-category-moment/add', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// PUT /api/v1/venue-category-moment/update
// body (multipart/form-data): Id, Title, Image, DisplayOrder
export const updateVenueCategoryMoment = async (formData) => {
  const response = await axiosInstance.put('venue-category-moment/update', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// GET /api/v1/venue-category-moment/GetAllVenueCategoryMoments
export const fetchAllVenueCategoryMoments = async () => {
  const response = await axiosInstance.get('venue-category-moment/GetAllVenueCategoryMoments', {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-moment/GetVenueCategoryMoment/{Id}
export const fetchVenueCategoryMomentById = async (id) => {
  const response = await axiosInstance.get(`venue-category-moment/GetVenueCategoryMoment/${id}`, {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-moment/GetByGuid/{venueCategoryGuid}
export const fetchVenueCategoryMomentsByGuid = async (venueCategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-category-moment/GetByGuid/${venueCategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-category-moment/delete/{Id}
export const deleteVenueCategoryMoment = async (id) => {
  const response = await axiosInstance.delete(`venue-category-moment/delete/${id}`, { headers });
  return response.data;
};