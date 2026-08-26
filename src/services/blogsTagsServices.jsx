import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// POST /api/v1/blog-tag/add
// body: { tagName: string }
export const createBlogTag = async (tagName) => {
  const response = await axiosInstance.post('blog-tag/add', { tagName }, { headers });
  return response.data;
};

// PUT /api/v1/blog-tag/update
// body: { id: number, tagName: string }
export const updateBlogTag = async (payload) => {
  const response = await axiosInstance.put('blog-tag/update', payload, { headers });
  return response.data;
};

// GET /api/v1/blog-tag/GetAllBlogTags
// returns: { result: [{ id, tagName, addedOn, status }], isSuccess, message, responseCode }
export const fetchBlogTags = async () => {
  const response = await axiosInstance.get('blog-tag/GetAllBlogTags', { headers });
  return response.data.result;
};

// DELETE /api/v1/blog-tag/delete/{Id}
export const deleteBlogTag = async (id) => {
  const response = await axiosInstance.delete(`blog-tag/delete/${id}`, { headers });
  return response.data;
};