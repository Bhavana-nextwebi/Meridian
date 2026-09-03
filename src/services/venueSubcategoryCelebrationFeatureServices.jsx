import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body - "icon" is a plain string field
  // (e.g. an icon class name or URL), not a file upload, so no multipart
  // Content-Type override is needed here.
};

// POST /api/v1/venue-subcategory-celebration-feature/add
// body (application/json): { venueSubcategoryGuid, title, description, icon, displayOrder }
export const addVenueSubcategoryCelebrationFeature = async (data) => {
  const response = await axiosInstance.post(
    'venue-subcategory-celebration-feature/add',
    data,
    { headers }
  );
  return response.data;
};

// PUT /api/v1/venue-subcategory-celebration-feature/update
// body (application/json): { id, title, description, icon, displayOrder }
export const updateVenueSubcategoryCelebrationFeature = async (data) => {
  const response = await axiosInstance.put(
    'venue-subcategory-celebration-feature/update',
    data,
    { headers }
  );
  return response.data;
};

// GET /api/v1/venue-subcategory-celebration-feature/get-all
export const fetchAllVenueSubcategoryCelebrationFeatures = async () => {
  const response = await axiosInstance.get(
    'venue-subcategory-celebration-feature/get-all',
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-subcategory-celebration-feature/get-by-id/{Id}
export const fetchVenueSubcategoryCelebrationFeatureById = async (id) => {
  const response = await axiosInstance.get(
    `venue-subcategory-celebration-feature/get-by-id/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-subcategory-celebration-feature/get-by-guid/{venueSubcategoryGuid}
export const fetchVenueSubcategoryCelebrationFeaturesByGuid = async (venueSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-subcategory-celebration-feature/get-by-guid/${venueSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-subcategory-celebration-feature/delete/{Id}
export const deleteVenueSubcategoryCelebrationFeature = async (id) => {
  const response = await axiosInstance.delete(
    `venue-subcategory-celebration-feature/delete/${id}`,
    { headers }
  );
  return response.data;
};