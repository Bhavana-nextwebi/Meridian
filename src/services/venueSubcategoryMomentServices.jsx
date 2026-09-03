import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data)
  // because both endpoints accept an Image file.
};

// POST /api/v1/venue-subcategory-moment/add
// body (multipart/form-data): VenueSubcategoryGuid, MomentLabel, Title, Description,
// Image (file), DisplayOrder
export const addVenueSubcategoryMoment = async (formData) => {
  const response = await axiosInstance.post('venue-subcategory-moment/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/venue-subcategory-moment/update
// body (multipart/form-data): Id, MomentLabel, Title, Description, Image (file), DisplayOrder
export const updateVenueSubcategoryMoment = async (formData) => {
  const response = await axiosInstance.put('venue-subcategory-moment/update', formData, { headers });
  return response.data;
};

// GET /api/v1/venue-subcategory-moment/get-all
export const fetchAllVenueSubcategoryMoments = async () => {
  const response = await axiosInstance.get('venue-subcategory-moment/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-moment/get-by-id/{Id}
export const fetchVenueSubcategoryMomentById = async (id) => {
  const response = await axiosInstance.get(`venue-subcategory-moment/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-moment/get-by-guid/{venueSubcategoryGuid}
export const fetchVenueSubcategoryMomentsByGuid = async (venueSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-subcategory-moment/get-by-guid/${venueSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-subcategory-moment/delete/{Id}
export const deleteVenueSubcategoryMoment = async (id) => {
  const response = await axiosInstance.delete(`venue-subcategory-moment/delete/${id}`, { headers });
  return response.data;
};