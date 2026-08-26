import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// POST /api/v1/lp-faq/add
// application/json: { lpGuid, question, answer, displayOrder }
export const addLpFaq = async (payload) => {
  const response = await axiosInstance.post('lp-faq/add', payload, { headers });
  return response.data;
};

// PUT /api/v1/lp-faq/update
// application/json: { id, question, answer, displayOrder }
export const updateLpFaq = async (payload) => {
  const response = await axiosInstance.put('lp-faq/update', payload, { headers });
  return response.data;
};

// GET /api/v1/lp-faq/GetAllLpFaqs
export const fetchAllLpFaqs = async () => {
  const response = await axiosInstance.get('lp-faq/GetAllLpFaqs', { headers });
  return response.data.result;
};

// GET /api/v1/lp-faq/GetLpFaq/{Id}
export const fetchLpFaqById = async (id) => {
  const response = await axiosInstance.get(`lp-faq/GetLpFaq/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/lp-faq/GetLpFaqsByLpGuid/{lpGuid}
export const fetchLpFaqsByLpGuid = async (lpGuid) => {
  const response = await axiosInstance.get(`lp-faq/GetLpFaqsByLpGuid/${lpGuid}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/lp-faq/delete/{Id}
export const deleteLpFaq = async (id) => {
  const response = await axiosInstance.delete(`lp-faq/delete/${id}`, { headers });
  return response.data;
};