import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body (no file fields), so no multipart
  // Content-Type override is needed here.
};

// POST /api/v1/venue-subcategory-why-choose/add
// body (application/json): { venueSubcategoryGuid, title, description, displayOrder }
export const addVenueSubcategoryWhyChoose = async (data) => {
  const response = await axiosInstance.post('venue-subcategory-why-choose/add', data, { headers });
  return response.data;
};

// PUT /api/v1/venue-subcategory-why-choose/update
// body (application/json): { id, title, description, displayOrder }
export const updateVenueSubcategoryWhyChoose = async (data) => {
  const response = await axiosInstance.put('venue-subcategory-why-choose/update', data, { headers });
  return response.data;
};

// GET /api/v1/venue-subcategory-why-choose/get-all
export const fetchAllVenueSubcategoryWhyChoose = async () => {
  const response = await axiosInstance.get('venue-subcategory-why-choose/get-all', { headers });
  return response.data.result;
};

// GET /api/v1/venue-subcategory-why-choose/get-by-id/{Id}
export const fetchVenueSubcategoryWhyChooseById = async (id) => {
  const response = await axiosInstance.get(
    `venue-subcategory-why-choose/get-by-id/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-subcategory-why-choose/get-by-guid/{venueSubcategoryGuid}
export const fetchVenueSubcategoryWhyChooseByGuid = async (venueSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-subcategory-why-choose/get-by-guid/${venueSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-subcategory-why-choose/delete/{Id}
export const deleteVenueSubcategoryWhyChoose = async (id) => {
  const response = await axiosInstance.delete(
    `venue-subcategory-why-choose/delete/${id}`,
    { headers }
  );
  return response.data;
};