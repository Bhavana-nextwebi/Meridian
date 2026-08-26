import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

const multipartHeaders = {
  'Content-Type': 'multipart/form-data',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/lp-event-gallery/add
// multipart/form-data: LpGuid, ImageUrl (file), DisplayOrder
export const addLpEventGalleryImage = async (formData) => {
  const response = await axiosInstance.post('lp-event-gallery/add', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// PUT /api/v1/lp-event-gallery/update
// multipart/form-data: Id, ImageUrl (file), DisplayOrder
export const updateLpEventGalleryImage = async (formData) => {
  const response = await axiosInstance.put('lp-event-gallery/update', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// GET /api/v1/lp-event-gallery/get-all-lp-event-galleries
export const fetchAllLpEventGalleries = async () => {
  const response = await axiosInstance.get('lp-event-gallery/get-all-lp-event-galleries', { headers });
  return response.data.result;
};

// GET /api/v1/lp-event-gallery/get-lp-event-gallery/{Id}
export const fetchLpEventGalleryById = async (id) => {
  const response = await axiosInstance.get(`lp-event-gallery/get-lp-event-gallery/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/lp-event-gallery/get-lp-event-galleries-by-lp-guid/{lpGuid}
export const fetchLpEventGalleriesByLpGuid = async (lpGuid) => {
  const response = await axiosInstance.get(
    `lp-event-gallery/get-lp-event-galleries-by-lp-guid/${lpGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/lp-event-gallery/delete/{Id}
export const deleteLpEventGalleryImage = async (id) => {
  const response = await axiosInstance.delete(`lp-event-gallery/delete/${id}`, { headers });
  return response.data;
};