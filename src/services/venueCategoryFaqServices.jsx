import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body per swagger example.
};

// POST /api/v1/venue-category-faq/add
// body (application/json): { venueCategoryGuid, question, answer, displayOrder }
export const addVenueCategoryFaq = async (data) => {
  const response = await axiosInstance.post('venue-category-faq/add', data, { headers });
  return response.data;
};

// PUT /api/v1/venue-category-faq/update
// body (application/json): { id, question, answer, displayOrder }
export const updateVenueCategoryFaq = async (data) => {
  const response = await axiosInstance.put('venue-category-faq/update', data, { headers });
  return response.data;
};

// GET /api/v1/venue-category-faq/GetAllVenueCategoryFaqs
export const fetchAllVenueCategoryFaqs = async () => {
  const response = await axiosInstance.get('venue-category-faq/GetAllVenueCategoryFaqs', {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-faq/GetVenueCategoryFaq/{Id}
export const fetchVenueCategoryFaqById = async (id) => {
  const response = await axiosInstance.get(`venue-category-faq/GetVenueCategoryFaq/${id}`, {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-faq/GetByGuid/{venueCategoryGuid}
export const fetchVenueCategoryFaqsByGuid = async (venueCategoryGuid) => {
  const response = await axiosInstance.get(`venue-category-faq/GetByGuid/${venueCategoryGuid}`, {
    headers,
  });
  return response.data.result;
};

// DELETE /api/v1/venue-category-faq/delete/{Id}
export const deleteVenueCategoryFaq = async (id) => {
  const response = await axiosInstance.delete(`venue-category-faq/delete/${id}`, { headers });
  return response.data;
};