import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// POST /api/v1/album-category/add
// body: { acTitle: string }
export const createAlbumCategory = async (acTitle) => {
  const response = await axiosInstance.post('album-category/add', { acTitle }, { headers });
  return response.data;
};

// PUT /api/v1/album-category/update
// body: { id: number, acTitle: string }
export const updateAlbumCategory = async (payload) => {
  const response = await axiosInstance.put('album-category/update', payload, { headers });
  return response.data;
};

// GET /api/v1/album-category/GetAllAlbumCategories
// returns: { result: [{ id, acTitle, addedOn, status }], isSuccess, message, responseCode }
export const fetchAlbumCategories = async () => {
  const response = await axiosInstance.get('album-category/GetAllAlbumCategories', { headers });
  return response.data.result;
};

// GET /api/v1/album-category/GetAlbumCategory/{Id}
export const fetchAlbumCategoryById = async (id) => {
  const response = await axiosInstance.get(`album-category/GetAlbumCategory/${id}`, { headers });
  return response.data.result;
};
export const deleteAlbumCategory = async (id) => {
  const response = await axiosInstance.delete(`album-category/delete/${id}`, { headers });
  return response.data;
};