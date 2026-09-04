import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/testimonial/add
// body (multipart/form-data): ClientName, ClientImage (file), TestimonialDesc, DisplayOrder
export const addTestimonial = async (formData) => {
  const response = await axiosInstance.post('testimonial/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/testimonial/update
// body (multipart/form-data): Id, ClientName, ClientImage (file, optional on update), TestimonialDesc, DisplayOrder
export const updateTestimonial = async (formData) => {
  const response = await axiosInstance.put('testimonial/update', formData, { headers });
  return response.data;
};

// GET /api/v1/testimonial/get-all-testimonials
export const fetchAllTestimonials = async () => {
  const response = await axiosInstance.get('testimonial/get-all-testimonials', { headers });
  return response.data.result;
};

// GET /api/v1/testimonial/get-testimonial/{Id}
export const fetchTestimonialById = async (id) => {
  const response = await axiosInstance.get(`testimonial/get-testimonial/${id}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/testimonial/delete/{Id}
export const deleteTestimonial = async (id) => {
  const response = await axiosInstance.delete(`testimonial/delete/${id}`, { headers });
  return response.data;
};