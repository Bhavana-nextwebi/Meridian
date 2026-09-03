import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
};

const multipartHeaders = {
  ...headers,
  'Content-Type': 'multipart/form-data',
};

// Venue Category Page now only owns: banner, intro-CTA block and SEO fields.
// Section1 (title/desc) moved to the Gallery page as IntroTitle/IntroDesc.
// Section3 (title/desc/image) moved to the Hosted page.
// Section4Title + Moments moved to the Moments page.
// FaqDesc moved to the Faq page.

// POST /api/v1/venue-category-page/add
// body (multipart/form-data): VenueCategoryId, BannerTitle, BannerImage,
// CtaTitle, CtaSubTitle, CtaDesc, CtaButtonText, PageTitle, MetaKey, MetaDesc
export const addVenueCategoryPage = async (formData) => {
  const response = await axiosInstance.post('venue-category-page/add', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// PUT /api/v1/venue-category-page/update
// body (multipart/form-data): Id, VenueCategoryId, BannerTitle, BannerImage,
// CtaTitle, CtaSubTitle, CtaDesc, CtaButtonText, PageTitle, MetaKey, MetaDesc
export const updateVenueCategoryPage = async (formData) => {
  const response = await axiosInstance.put('venue-category-page/update', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// GET /api/v1/venue-category-page/GetAllVenueCategoryPages
export const fetchAllVenueCategoryPages = async () => {
  const response = await axiosInstance.get('venue-category-page/GetAllVenueCategoryPages', {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-page/GetVenueCategoryPage/{Id}
export const fetchVenueCategoryPageById = async (id) => {
  const response = await axiosInstance.get(`venue-category-page/GetVenueCategoryPage/${id}`, {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-page/GetByCategoryId/{venueCategoryId}
export const fetchVenueCategoryPageByCategoryId = async (venueCategoryId) => {
  const response = await axiosInstance.get(
    `venue-category-page/GetByCategoryId/${venueCategoryId}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-category-page/GetByGuid/{venueCategoryGuid}
export const fetchVenueCategoryPageByGuid = async (venueCategoryGuid) => {
  const response = await axiosInstance.get(`venue-category-page/GetByGuid/${venueCategoryGuid}`, {
    headers,
  });
  return response.data.result;
};

// DELETE /api/v1/venue-category-page/delete/{Id}
export const deleteVenueCategoryPage = async (id) => {
  const response = await axiosInstance.delete(`venue-category-page/delete/${id}`, { headers });
  return response.data;
};