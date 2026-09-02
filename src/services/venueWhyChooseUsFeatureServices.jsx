import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/venue-why-choose-us-feature/add
// body (multipart/form-data): VenueGuid, FeatureTitle, FeatureDescription, FeatureIcon (file), DisplayOrder
export const addVenueWhyChooseUsFeature = async (formData) => {
  const response = await axiosInstance.post(
    'venue-why-choose-us-feature/add',
    formData,
    { headers }
  );
  return response.data;
};

// PUT /api/v1/venue-why-choose-us-feature/update
// body (multipart/form-data): Id, FeatureTitle, FeatureDescription, FeatureIcon (file), DisplayOrder
export const updateVenueWhyChooseUsFeature = async (formData) => {
  const response = await axiosInstance.put(
    'venue-why-choose-us-feature/update',
    formData,
    { headers }
  );
  return response.data;
};

// GET /api/v1/venue-why-choose-us-feature/get-all
export const fetchAllVenueWhyChooseUsFeatures = async () => {
  const response = await axiosInstance.get('venue-why-choose-us-feature/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-why-choose-us-feature/get-by-id/{Id}
export const fetchVenueWhyChooseUsFeatureById = async (id) => {
  const response = await axiosInstance.get(
    `venue-why-choose-us-feature/get-by-id/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-why-choose-us-feature/get-by-guid/{venueGuid}
export const fetchVenueWhyChooseUsFeaturesByVenueGuid = async (venueGuid) => {
  const response = await axiosInstance.get(
    `venue-why-choose-us-feature/get-by-guid/${venueGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-why-choose-us-feature/delete/{Id}
export const deleteVenueWhyChooseUsFeature = async (id) => {
  const response = await axiosInstance.delete(
    `venue-why-choose-us-feature/delete/${id}`,
    { headers }
  );
  return response.data;
};