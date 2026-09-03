import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body (no file fields), so no multipart
  // Content-Type override is needed here.
};

// POST /api/v1/venue-subcategory-faq/add
// body (application/json): { venueSubcategoryGuid, question, answer, displayOrder }
export const addVenueSubcategoryFaq = async (data) => {
  const response = await axiosInstance.post('venue-subcategory-faq/add', data, { headers });
  return response.data;
};

// PUT /api/v1/venue-subcategory-faq/update
// body (application/json): { id, question, answer, displayOrder }
export const updateVenueSubcategoryFaq = async (data) => {
  const response = await axiosInstance.put('venue-subcategory-faq/update', data, { headers });
  return response.data;
};

// GET /api/v1/venue-subcategory-faq/get-all
export const fetchAllVenueSubcategoryFaq = async () => {
  const response = await axiosInstance.get('venue-subcategory-faq/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-faq/get-by-id/{Id}
export const fetchVenueSubcategoryFaqById = async (id) => {
  const response = await axiosInstance.get(`venue-subcategory-faq/get-by-id/${id}`, { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-faq/get-by-guid/{venueSubcategoryGuid}
export const fetchVenueSubcategoryFaqByGuid = async (venueSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-subcategory-faq/get-by-guid/${venueSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-subcategory-faq/delete/{Id}
export const deleteVenueSubcategoryFaq = async (id) => {
  const response = await axiosInstance.delete(`venue-subcategory-faq/delete/${id}`, { headers });
  return response.data;
};