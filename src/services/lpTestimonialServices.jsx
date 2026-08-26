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

// POST /api/v1/lp-testimonial/add
// multipart/form-data: LpGuid, TestimonialName, TestimonialImage (file),
// TestimonialDescription, Rating, DisplayOrder
export const addLpTestimonial = async (formData) => {
  const response = await axiosInstance.post('lp-testimonial/add', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// PUT /api/v1/lp-testimonial/update
// multipart/form-data: Id, TestimonialName, TestimonialImage (file),
// TestimonialDescription, Rating, TestimonialDate, DisplayOrder
export const updateLpTestimonial = async (formData) => {
  const response = await axiosInstance.put('lp-testimonial/update', formData, {
    headers: multipartHeaders,
  });
  return response.data;
};

// GET /api/v1/lp-testimonial/gwt-all-lp-testimonials
// NOTE: this path (misspelled "gwt" instead of "get") is exactly as given in the API spec.
export const fetchAllLpTestimonials = async () => {
  const response = await axiosInstance.get('lp-testimonial/gwt-all-lp-testimonials', { headers });
  return response.data.result;
};

// GET /api/v1/lp-testimonial/get-lp-testimonial/{Id}
export const fetchLpTestimonialById = async (id) => {
  const response = await axiosInstance.get(`lp-testimonial/get-lp-testimonial/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/lp-testimonial/get-lp-testimonials-by-lp-guid/{lpGuid}
export const fetchLpTestimonialsByLpGuid = async (lpGuid) => {
  const response = await axiosInstance.get(
    `lp-testimonial/get-lp-testimonials-by-lp-guid/${lpGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/lp-testimonial/delete/{Id}
export const deleteLpTestimonial = async (id) => {
  const response = await axiosInstance.delete(`lp-testimonial/delete/${id}`, { headers });
  return response.data;
};