import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body (no file fields), so no multipart
  // Content-Type override is needed here.
};

// POST /api/v1/venue-subcategory-intro-feature/add
// body (application/json): { venueSubcategoryGuid, featureTitle, displayOrder }
export const addVenueSubcategoryIntroFeature = async (data) => {
  const response = await axiosInstance.post('venue-subcategory-intro-feature/add', data, { headers });
  return response.data;
};

// PUT /api/v1/venue-subcategory-intro-feature/update
// body (application/json): { id, featureTitle, displayOrder }
export const updateVenueSubcategoryIntroFeature = async (data) => {
  const response = await axiosInstance.put('venue-subcategory-intro-feature/update', data, { headers });
  return response.data;
};

// GET /api/v1/venue-subcategory-intro-feature/get-all
export const fetchAllVenueSubcategoryIntroFeatures = async () => {
  const response = await axiosInstance.get('venue-subcategory-intro-feature/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-intro-feature/get-by-id/{Id}
export const fetchVenueSubcategoryIntroFeatureById = async (id) => {
  const response = await axiosInstance.get(
    `venue-subcategory-intro-feature/get-by-id/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-subcategory-intro-feature/get-by-guid/{venueSubcategoryGuid}
export const fetchVenueSubcategoryIntroFeaturesByGuid = async (venueSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-subcategory-intro-feature/get-by-guid/${venueSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-subcategory-intro-feature/delete/{Id}
export const deleteVenueSubcategoryIntroFeature = async (id) => {
  const response = await axiosInstance.delete(
    `venue-subcategory-intro-feature/delete/${id}`,
    { headers }
  );
  return response.data;
};