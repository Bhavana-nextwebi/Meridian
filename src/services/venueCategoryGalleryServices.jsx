import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
};

const multipartHeaders = {
  ...headers,
  'Content-Type': 'multipart/form-data',
};

// POST /api/v1/venue-category-gallery/add
// body (multipart/form-data): VenueCategoryGuid, Image, DisplayOrder
export const addVenueCategoryGallery = async (formData) => {
  const response = await axiosInstance.post('venue-category-gallery/add', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// PUT /api/v1/venue-category-gallery/update
// body (multipart/form-data): Id, Image, DisplayOrder
export const updateVenueCategoryGallery = async (formData) => {
  const response = await axiosInstance.put('venue-category-gallery/update', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// GET /api/v1/venue-category-gallery/GetAllVenueCategoryGalleries
export const fetchAllVenueCategoryGalleries = async () => {
  const response = await axiosInstance.get(
    'venue-category-gallery/GetAllVenueCategoryGalleries',
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-category-gallery/GetVenueCategoryGallery/{Id}
export const fetchVenueCategoryGalleryById = async (id) => {
  const response = await axiosInstance.get(`venue-category-gallery/GetVenueCategoryGallery/${id}`, {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-gallery/GetByGuid/{venueCategoryGuid}
export const fetchVenueCategoryGalleriesByGuid = async (venueCategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-category-gallery/GetByGuid/${venueCategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-category-gallery/delete/{Id}
export const deleteVenueCategoryGallery = async (id) => {
  const response = await axiosInstance.delete(`venue-category-gallery/delete/${id}`, { headers });
  return response.data;
};