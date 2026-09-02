import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// POST /api/v1/venue-subcategory/add
// body: { venueCategoryId: number, venueSubcategoryName: string, displayOrder: number }
export const createVenueSubcategory = async (venueCategoryId, venueSubcategoryName, displayOrder) => {
  const response = await axiosInstance.post('venue-subcategory/add', { venueCategoryId, venueSubcategoryName, displayOrder }, { headers });
  return response.data;
};

// PUT /api/v1/venue-subcategory/update
// body: { id: number, venueCategoryId: number, venueSubcategoryName: string, displayOrder: number }
export const updateVenueSubcategory = async (payload) => {
  const response = await axiosInstance.put('venue-subcategory/update', payload, { headers });
  return response.data;
};

// GET /api/v1/venue-subcategory/get-all
// returns: { result: [{ id, venueCategoryId, venueCategoryName, venueSubcategoryName, displayOrder, addedOn, addedIp, status }], isSuccess, message, responseCode }
export const fetchVenueSubcategories = async () => {
  const response = await axiosInstance.get('venue-subcategory/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory/get-by-id/{Id}
export const fetchVenueSubcategoryById = async (id) => {
  const response = await axiosInstance.get(`venue-subcategory/get-by-id/${id}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/venue-subcategory/delete/{Id}
export const deleteVenueSubcategory = async (id) => {
  const response = await axiosInstance.delete(`venue-subcategory/delete/${id}`, { headers });
  return response.data;
};