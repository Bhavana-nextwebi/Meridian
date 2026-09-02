import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// POST /api/v1/venue-category/add
// body: { venueCategoryName: string, displayOrder: number }
export const createVenueCategory = async (venueCategoryName, displayOrder) => {
  const response = await axiosInstance.post('venue-category/add', { venueCategoryName, displayOrder }, { headers });
  return response.data;
};

// PUT /api/v1/venue-category/update
// body: { id: number, venueCategoryName: string, displayOrder: number }
export const updateVenueCategory = async (payload) => {
  const response = await axiosInstance.put('venue-category/update', payload, { headers });
  return response.data;
};

// GET /api/v1/venue-category/get-all
// returns: { result: [{ id, venueCategoryName, displayOrder, addedOn, addedIp, status }], isSuccess, message, responseCode }
export const fetchVenueCategories = async () => {
  const response = await axiosInstance.get('venue-category/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-category/get-by-id/{Id}
export const fetchVenueCategoryById = async (id) => {
  const response = await axiosInstance.get(`venue-category/get-by-id/${id}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/venue-category/delete/{Id}
export const deleteVenueCategory = async (id) => {
  const response = await axiosInstance.delete(`venue-category/delete/${id}`, { headers });
  return response.data;
};