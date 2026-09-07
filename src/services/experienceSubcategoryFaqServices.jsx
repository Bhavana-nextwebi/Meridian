import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-subcategory-faq/add
// Body: { experienceSubcategoryGuid, question, answer, displayOrder }
export const addExperienceSubcategoryFaq = async (data) => {
  const response = await axiosInstance.post('experience-subcategory-faq/add', data, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory-faq/update
// Body: { id, question, answer, displayOrder }
export const updateExperienceSubcategoryFaq = async (data) => {
  const response = await axiosInstance.put('experience-subcategory-faq/update', data, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory-faq/GetAllExperienceSubcategoryFaqs
export const fetchAllExperienceSubcategoryFaqs = async () => {
  const response = await axiosInstance.get(
    'experience-subcategory-faq/GetAllExperienceSubcategoryFaqs',
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/experience-subcategory-faq/GetExperienceSubcategoryFaq/{Id}
export const fetchExperienceSubcategoryFaqById = async (id) => {
  const response = await axiosInstance.get(
    `experience-subcategory-faq/GetExperienceSubcategoryFaq/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/experience-subcategory-faq/GetByExperienceSubcategoryGuid/{experienceSubcategoryGuid}
export const fetchExperienceSubcategoryFaqsByGuid = async (experienceSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `experience-subcategory-faq/GetByExperienceSubcategoryGuid/${experienceSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory-faq/delete/{Id}
export const deleteExperienceSubcategoryFaq = async (id) => {
  const response = await axiosInstance.delete(
    `experience-subcategory-faq/delete/${id}`,
    { headers }
  );
  return response.data;
};