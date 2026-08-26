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

// POST /api/v1/lp-banquet-space-detail/add
// multipart/form-data: LpGuid, SpaceTitle, SpaceDescription, SpaceImage (file), DisplayOrder
export const addLpBanquetSpaceDetail = async (formData) => {
  const response = await axiosInstance.post('lp-banquet-space-detail/add', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// PUT /api/v1/lp-banquet-space-detail/update
// multipart/form-data: Id, SpaceTitle, SpaceDescription, SpaceImage (file), DisplayOrder
export const updateLpBanquetSpaceDetail = async (formData) => {
  const response = await axiosInstance.put('lp-banquet-space-detail/update', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// GET /api/v1/lp-banquet-space-detail/get-all-lp-banquet-space-details
export const fetchAllLpBanquetSpaceDetails = async () => {
  const response = await axiosInstance.get(
    'lp-banquet-space-detail/get-all-lp-banquet-space-details',
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/lp-banquet-space-detail/get-lp-banquet-space-detail/{Id}
export const fetchLpBanquetSpaceDetailById = async (id) => {
  const response = await axiosInstance.get(
    `lp-banquet-space-detail/get-lp-banquet-space-detail/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/lp-banquet-space-detail/get-lp-banquet-space-details-by-lp-guid/{lpGuid}
export const fetchLpBanquetSpaceDetailsByLpGuid = async (lpGuid) => {
  const response = await axiosInstance.get(
    `lp-banquet-space-detail/get-lp-banquet-space-details-by-lp-guid/${lpGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/lp-banquet-space-detail/delete/{Id}
export const deleteLpBanquetSpaceDetail = async (id) => {
  const response = await axiosInstance.delete(`lp-banquet-space-detail/delete/${id}`, { headers });
  return response.data;
};