import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/venue-subcategory-page/add
// body (multipart/form-data): VenueSubcategoryId, BannerTitle, BannerImage (file),
// VenueTitle, VenueDescription, VenueImageTitle, VenueImage (file), SettingTitle,
// SettingDescription, SettingImage (file), MomentsTitle, MomentsDescription,
// WhyTitle, WhyDescription, PageTitle, MetaKey, MetaDesc
export const addVenueSubcategoryPage = async (formData) => {
  const response = await axiosInstance.post('venue-subcategory-page/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/venue-subcategory-page/update
// body (multipart/form-data): Id, VenueSubcategoryId, BannerTitle, BannerImage (file),
// VenueTitle, VenueDescription, VenueImageTitle, VenueImage (file), SettingTitle,
// SettingDescription, SettingImage (file), MomentsTitle, MomentsDescription,
// WhyTitle, WhyDescription, PageTitle, MetaKey, MetaDesc
export const updateVenueSubcategoryPage = async (formData) => {
  const response = await axiosInstance.put('venue-subcategory-page/update', formData, { headers });
  return response.data;
};

// GET /api/v1/venue-subcategory-page/get-all
export const fetchAllVenueSubcategoryPages = async () => {
  const response = await axiosInstance.get('venue-subcategory-page/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-page/get-by-id/{Id}
export const fetchVenueSubcategoryPageById = async (id) => {
  const response = await axiosInstance.get(`venue-subcategory-page/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-page/get-by-guid/{venueSubcategoryGuid}
export const fetchVenueSubcategoryPageByGuid = async (venueSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-subcategory-page/get-by-guid/${venueSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-subcategory-page/get-by-subcategory-id/{venueSubcategoryId}
export const fetchVenueSubcategoryPageBySubcategoryId = async (venueSubcategoryId) => {
  const response = await axiosInstance.get(
    `venue-subcategory-page/get-by-subcategory-id/${venueSubcategoryId}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-subcategory-page/delete/{Id}
export const deleteVenueSubcategoryPage = async (id) => {
  const response = await axiosInstance.delete(`venue-subcategory-page/delete/${id}`, { headers });
  return response.data;
};