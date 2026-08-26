import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// POST /api/v1/blog/add
// multipart/form-data: BlogTitle, BlogUrl, TagId[] (multiple), PostedOn, PostedBy, BlogImage (file), FullDescription
export const addBlog = async (formData) => {
  const response = await axiosInstance.post('blog/add', formData, {
    headers: {
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
  });
  return response.data;
};

export const updateBlog = async (payload) => {
  return await axiosInstance.put('blog/update', payload, {
    headers: {
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
  });
};

export const deleteBlog = async (blogId) => {
  return await axiosInstance.delete(`blog/${blogId}`, { headers });
};

// PUT /api/v1/blog/publish-unpublish
// body: { id, isPublished }
// Replaces the old status ('Active'/'Draft') and featured toggles.
export const publishUnpublishBlog = async (id, isPublished) => {
  const response = await axiosInstance.put(
    'blog/publish-unpublish',
    { id, isPublished },
    { headers }
  );
  return response.data;
};

// GET /api/v1/blog/GetBlog/{Id}
export const fetchBlogData = async (blogId) => {
  const response = await axiosInstance.get(`blog/GetBlog/${blogId}`, { headers });
  return response.data.result;
};

// GET /api/v1/blog/GetAllBlogs
// Returns ALL blogs at once (no server-side pagination/filter endpoint exists).
// Manage Blogs does pagination, date filtering, and search client-side.
export const fetchAllBlogs = async () => {
  const response = await axiosInstance.get('blog/GetAllBlogs', { headers });
  return response.data.result;
};