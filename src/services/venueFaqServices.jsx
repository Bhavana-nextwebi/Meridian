import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // FAQ add/update take a plain JSON body (no file fields), so no
  // multipart Content-Type override is needed here.
};

// POST /api/v1/venue-faq/add
// body (application/json): { venueGuid, question, answer, displayOrder }
export const addVenueFaq = async (data) => {
  const response = await axiosInstance.post('venue-faq/add', data, { headers });
  return response.data;
};

// PUT /api/v1/venue-faq/update
// body (application/json): { id, question, answer, displayOrder }
export const updateVenueFaq = async (data) => {
  const response = await axiosInstance.put('venue-faq/update', data, { headers });
  return response.data;
};

// GET /api/v1/venue-faq/get-all
export const fetchAllVenueFaq = async () => {
  const response = await axiosInstance.get('venue-faq/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-faq/get-by-id/{Id}
export const fetchVenueFaqById = async (id) => {
  const response = await axiosInstance.get(`venue-faq/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/venue-faq/get-by-guid/{venueGuid}
export const fetchVenueFaqByVenueGuid = async (venueGuid) => {
  const response = await axiosInstance.get(`venue-faq/get-by-guid/${venueGuid}`, { headers });
  return response.data.result;
};

// DELETE /api/v1/venue-faq/delete/{Id}
export const deleteVenueFaq = async (id) => {
  const response = await axiosInstance.delete(`venue-faq/delete/${id}`, { headers });
  return response.data;
};