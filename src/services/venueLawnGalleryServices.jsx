import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/venue-lawn-gallery/add
// body (multipart/form-data): VenueGuid, Title, Image (file), DisplayOrder
export const addVenueLawnGalleryItem = async (formData) => {
  const response = await axiosInstance.post('venue-lawn-gallery/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/venue-lawn-gallery/update
// body (multipart/form-data): Id, Title, Image (file), DisplayOrder
export const updateVenueLawnGalleryItem = async (formData) => {
  const response = await axiosInstance.put('venue-lawn-gallery/update', formData, { headers });
  return response.data;
};

// GET /api/v1/venue-lawn-gallery/get-all
export const fetchAllVenueLawnGallery = async () => {
  const response = await axiosInstance.get('venue-lawn-gallery/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-lawn-gallery/get-by-id/{Id}
export const fetchVenueLawnGalleryItemById = async (id) => {
  const response = await axiosInstance.get(`venue-lawn-gallery/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/venue-lawn-gallery/get-by-guid/{venueGuid}
export const fetchVenueLawnGalleryByVenueGuid = async (venueGuid) => {
  const response = await axiosInstance.get(
    `venue-lawn-gallery/get-by-guid/${venueGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-lawn-gallery/delete/{Id}
export const deleteVenueLawnGalleryItem = async (id) => {
  const response = await axiosInstance.delete(`venue-lawn-gallery/delete/${id}`, { headers });
  return response.data;
};