import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// NOTE: Do NOT set 'Content-Type': 'multipart/form-data' manually.
// When a FormData body is sent, axios/the browser must generate the
// Content-Type itself so it includes the multipart boundary
// (e.g. "multipart/form-data; boundary=----WebKit..."). Setting it
// manually with no boundary breaks server-side multipart parsing.
const multipartHeaders = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/album/add
// multipart/form-data:
//   AlbumCategoryId, AlbumCategoryName, AlbumTitle, AlbumType ("Image" | "Video")
//   If AlbumType === "Image": ImageUrl (file)
//   If AlbumType === "Video": AlbumVideo (file) OR VideoUrl (string link) — one of the two
export const createAlbum = async (formData) => {
  const response = await axiosInstance.post('album/add', formData, { headers: multipartHeaders });
  return response.data;
};

// PUT /api/v1/album/update
// multipart/form-data: Id + same fields as above (files optional on update, existing media kept if omitted)
export const updateAlbum = async (formData) => {
  const response = await axiosInstance.put('album/update', formData, { headers: multipartHeaders });
  return response.data;
};

// GET /api/v1/album/GetAllAlbums
export const fetchAlbums = async () => {
  const response = await axiosInstance.get('album/GetAllAlbums', { headers });
  return response.data.result;
};

// GET /api/v1/album/GetAlbum/{Id}
export const fetchAlbumById = async (id) => {
  const response = await axiosInstance.get(`album/GetAlbum/${id}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/album/delete/{Id}
export const deleteAlbum = async (id) => {
  const response = await axiosInstance.delete(`album/delete/${id}`, { headers });
  return response.data;
};