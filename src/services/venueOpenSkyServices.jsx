import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data)
  // because both endpoints accept an Image file.
};

// POST /api/v1/venue-open-sky/add
// body (multipart/form-data): VenueGuid, Title, Description, Image (file), DisplayOrder
export const addVenueOpenSky = async (formData) => {
  const response = await axiosInstance.post('venue-open-sky/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/venue-open-sky/update
// body (multipart/form-data): Id, Title, Description, Image (file), DisplayOrder
export const updateVenueOpenSky = async (formData) => {
  const response = await axiosInstance.put('venue-open-sky/update', formData, { headers });
  return response.data;
};

// GET /api/v1/venue-open-sky/get-all
export const fetchAllVenueOpenSky = async () => {
  const response = await axiosInstance.get('venue-open-sky/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-open-sky/get-by-id/{Id}
export const fetchVenueOpenSkyById = async (id) => {
  const response = await axiosInstance.get(`venue-open-sky/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/venue-open-sky/get-by-guid/{venueGuid}
export const fetchVenueOpenSkyByVenueGuid = async (venueGuid) => {
  const response = await axiosInstance.get(`venue-open-sky/get-by-guid/${venueGuid}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/venue-open-sky/delete/{Id}
export const deleteVenueOpenSky = async (id) => {
  const response = await axiosInstance.delete(`venue-open-sky/delete/${id}`, { headers });
  return response.data;
};