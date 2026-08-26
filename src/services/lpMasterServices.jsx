import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

const multipartHeaders = {
  'Content-Type': 'multipart/form-data',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/lp-master/add
// multipart/form-data: LpTitle, LpUrl, LpDesc, BanquetHallTitle, BanquetHallSubtitle,
// Experience, BanquetHallImage (file), BanquetHallDescription, WhyChooseTitle,
// WhyChooseSubtitle, WhyChooseImage (file), WhyChooseDescription
export const addLandingPage = async (formData) => {
  const response = await axiosInstance.post('lp-master/add', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// PUT /api/v1/lp-master/update
// multipart/form-data: Id + same fields as add
export const updateLandingPage = async (formData) => {
  const response = await axiosInstance.put('lp-master/update', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// GET /api/v1/lp-master/get-all
export const fetchAllLandingPages = async () => {
  const response = await axiosInstance.get('lp-master/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/lp-master/get-lp-page/{Id}
export const fetchLandingPageById = async (id) => {
  const response = await axiosInstance.get(`lp-master/get-lp-page/${id}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/lp-master/delete/{Id}
export const deleteLandingPage = async (id) => {
  const response = await axiosInstance.delete(`lp-master/delete/${id}`, { headers });
  return response.data;
};
// body: { id, isPublished }
export const publishUnpublishLandingPage = async (id, isPublished) => {
  const response = await axiosInstance.put(
    'lp-master/publish-unpublish',
    { id, isPublished },
    { headers }
  );
  return response.data;
};