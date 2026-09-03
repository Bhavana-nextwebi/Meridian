import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body per swagger example.
};

// POST /api/v1/venue-category-hosted/add
// body (application/json): { venueCategoryGuid, title, displayOrder }
export const addVenueCategoryHosted = async (data) => {
  const response = await axiosInstance.post('venue-category-hosted/add', data, { headers });
  return response.data;
};

// PUT /api/v1/venue-category-hosted/update
// body (application/json): { id, title, displayOrder }
export const updateVenueCategoryHosted = async (data) => {
  const response = await axiosInstance.put('venue-category-hosted/update', data, { headers });
  return response.data;
};

// GET /api/v1/venue-category-hosted/GetAllVenueCategoryHosted
export const fetchAllVenueCategoryHosted = async () => {
  const response = await axiosInstance.get('venue-category-hosted/GetAllVenueCategoryHosted', {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-hosted/GetVenueCategoryHosted/{Id}
export const fetchVenueCategoryHostedById = async (id) => {
  const response = await axiosInstance.get(`venue-category-hosted/GetVenueCategoryHosted/${id}`, {
    headers,
  });
  return response.data.result;
};

// GET /api/v1/venue-category-hosted/GetByGuid/{venueCategoryGuid}
export const fetchVenueCategoryHostedByGuid = async (venueCategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-category-hosted/GetByGuid/${venueCategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-category-hosted/delete/{Id}
export const deleteVenueCategoryHosted = async (id) => {
  const response = await axiosInstance.delete(`venue-category-hosted/delete/${id}`, { headers });
  return response.data;
};