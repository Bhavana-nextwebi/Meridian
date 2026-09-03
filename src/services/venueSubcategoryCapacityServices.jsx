import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body (no file fields), so no multipart
  // Content-Type override is needed here.
};

// POST /api/v1/venue-subcategory-capacity/add
// body (application/json): { venueSubcategoryGuid, title, capacity, displayOrder }
export const addVenueSubcategoryCapacity = async (data) => {
  const response = await axiosInstance.post('venue-subcategory-capacity/add', data, { headers });
  return response.data;
};

// PUT /api/v1/venue-subcategory-capacity/update
// body (application/json): { id, title, capacity, displayOrder }
export const updateVenueSubcategoryCapacity = async (data) => {
  const response = await axiosInstance.put('venue-subcategory-capacity/update', data, { headers });
  return response.data;
};

// GET /api/v1/venue-subcategory-capacity/get-all
export const fetchAllVenueSubcategoryCapacity = async () => {
  const response = await axiosInstance.get('venue-subcategory-capacity/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-capacity/get-by-id/{Id}
export const fetchVenueSubcategoryCapacityById = async (id) => {
  const response = await axiosInstance.get(`venue-subcategory-capacity/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-capacity/get-by-guid/{venueSubcategoryGuid}
export const fetchVenueSubcategoryCapacityByGuid = async (venueSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-subcategory-capacity/get-by-guid/${venueSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-subcategory-capacity/delete/{Id}
export const deleteVenueSubcategoryCapacity = async (id) => {
  const response = await axiosInstance.delete(`venue-subcategory-capacity/delete/${id}`, { headers });
  return response.data;
};