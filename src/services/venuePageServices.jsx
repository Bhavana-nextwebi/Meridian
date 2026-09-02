import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/venue-page/add
// body (multipart/form-data): VenueCategoryId, VenueCategoryName, VenueSubcategoryId,
// VenueSubcategoryName, BannerTitle, BannerImage (file), VenueTitle, VenueDescription,
// VenueImage (file), ExploreCtaTitle, ExploreCtaDescription, WhyChooseTitle,
// WhyChooseDescription, WhyChooseImage (file), PageTitle, MetaKey, MetaDesc
export const addVenuePage = async (formData) => {
  const response = await axiosInstance.post('venue-page/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/venue-page/update
// body (multipart/form-data): Id, VenueCategoryId, VenueCategoryName, VenueSubcategoryId,
// VenueSubcategoryName, BannerTitle, BannerImage (file), VenueTitle, VenueDescription,
// VenueImage (file), ExploreCtaTitle, ExploreCtaDescription, WhyChooseTitle,
// WhyChooseDescription, WhyChooseImage (file), PageTitle, MetaKey, MetaDesc
export const updateVenuePage = async (formData) => {
  const response = await axiosInstance.put('venue-page/update', formData, { headers });
  return response.data;
};

// GET /api/v1/venue-page/get-all
export const fetchAllVenuePages = async () => {
  const response = await axiosInstance.get('venue-page/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-page/get-by-id/{Id}
export const fetchVenuePageById = async (id) => {
  const response = await axiosInstance.get(`venue-page/get-by-id/${id}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/venue-page/delete/{Id}
export const deleteVenuePage = async (id) => {
  const response = await axiosInstance.delete(`venue-page/delete/${id}`, { headers });
  return response.data;
};