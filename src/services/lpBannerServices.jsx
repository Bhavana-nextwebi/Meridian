import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// NOTE: Do NOT set 'Content-Type': 'multipart/form-data' manually — axios
// needs to generate it itself so it includes the multipart boundary
// (e.g. "multipart/form-data; boundary=----WebKit..."). A manually set
// value with no boundary breaks server-side multipart parsing (500s).
const multipartHeaders = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/lp-banner/add
// multipart/form-data: LpGuid, BannerImage (file), DisplayOrder
export const addLpBanner = async (formData) => {
  const response = await axiosInstance.post('lp-banner/add', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// PUT /api/v1/lp-banner/update
// multipart/form-data: Id, BannerImage (file, optional on update), DisplayOrder
export const updateLpBanner = async (formData) => {
  const response = await axiosInstance.put('lp-banner/update', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// GET /api/v1/lp-banner/get-all
export const fetchAllLpBanners = async () => {
  const response = await axiosInstance.get('lp-banner/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/lp-banner/get-by-id/{Id}
export const fetchLpBannerById = async (id) => {
  const response = await axiosInstance.get(`lp-banner/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/lp-banner/get-by-lp-guid/{lpGuid}
export const fetchLpBannersByLpGuid = async (lpGuid) => {
  const response = await axiosInstance.get(
    `lp-banner/get-by-lp-guid/${lpGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/lp-banner/delete/{Id}
export const deleteLpBanner = async (id) => {
  const response = await axiosInstance.delete(`lp-banner/delete/${id}`, { headers });
  return response.data;
};