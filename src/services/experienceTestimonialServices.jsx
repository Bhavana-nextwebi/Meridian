import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // No 'Content-Type' here - add/update send FormData (multipart/form-data).
};

// POST /api/v1/experience-testimonial/add
// body (multipart/form-data): ExperienceGuid, CustomerName, CustomerImage (file), TestimonialDesc, DisplayOrder
export const addExperienceTestimonial = async (formData) => {
  const response = await axiosInstance.post('experience-testimonial/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-testimonial/update
// body (multipart/form-data): Id, CustomerName, CustomerImage (file), TestimonialDesc, DisplayOrder
export const updateExperienceTestimonial = async (formData) => {
  const response = await axiosInstance.put('experience-testimonial/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-testimonial/get-all
export const fetchAllExperienceTestimonials = async () => {
  const response = await axiosInstance.get('experience-testimonial/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/experience-testimonial/get-by-id/{Id}
export const fetchExperienceTestimonialById = async (id) => {
  const response = await axiosInstance.get(`experience-testimonial/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-testimonial/get-by-experience-guid/{experienceGuid}
export const fetchExperienceTestimonialsByExperienceGuid = async (experienceGuid) => {
  const response = await axiosInstance.get(
    `experience-testimonial/get-by-experience-guid/${experienceGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-testimonial/delete/{Id}
export const deleteExperienceTestimonial = async (id) => {
  const response = await axiosInstance.delete(`experience-testimonial/delete/${id}`, { headers });
  return response.data;
};