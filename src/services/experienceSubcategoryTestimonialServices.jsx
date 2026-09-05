import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-subcategory-testimonial/add
export const addExperienceSubcategoryTestimonial = async (formData) => {
  const response = await axiosInstance.post('experience-subcategory-testimonial/add', formData, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory-testimonial/update
export const updateExperienceSubcategoryTestimonial = async (formData) => {
  const response = await axiosInstance.put('experience-subcategory-testimonial/update', formData, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory-testimonial/GetAllExperienceSubcategoryTestimonials
export const fetchAllExperienceSubcategoryTestimonials = async () => {
  const response = await axiosInstance.get('experience-subcategory-testimonial/GetAllExperienceSubcategoryTestimonials', { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-testimonial/GetExperienceSubcategoryTestimonial/{Id}
export const fetchExperienceSubcategoryTestimonialById = async (id) => {
  const response = await axiosInstance.get(`experience-subcategory-testimonial/GetExperienceSubcategoryTestimonial/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/experience-subcategory-testimonial/GetByGuid/{experienceSubcategoryGuid}
export const fetchExperienceSubcategoryTestimonialsByGuid = async (experienceSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `experience-subcategory-testimonial/GetByGuid/${experienceSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory-testimonial/delete/{Id}
export const deleteExperienceSubcategoryTestimonial = async (id) => {
  const response = await axiosInstance.delete(`experience-subcategory-testimonial/delete/${id}`, { headers });
  return response.data;
};
