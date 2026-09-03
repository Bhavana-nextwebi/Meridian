import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body per swagger example.
};

// POST /api/v1/venue-category-distinctive/add
// body (application/json): { venueCategoryGuid, title, description, displayOrder }
export const addVenueCategoryDistinctive = async (data) => {
  const response = await axiosInstance.post('venue-category-distinctive/add', data, { headers });
  return response.data;
};

// PUT /api/v1/venue-category-distinctive/update
// body (application/json): { id, title, description, displayOrder }
export const updateVenueCategoryDistinctive = async (data) => {
  const response = await axiosInstance.put('venue-category-distinctive/update', data, { headers });
  return response.data;
};

// GET /api/v1/venue-category-distinctive/GetAllVenueCategoryDistinctive
export const fetchAllVenueCategoryDistinctive = async () => {
  const response = await axiosInstance.get(
    'venue-category-distinctive/GetAllVenueCategoryDistinctive',
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-category-distinctive/GetVenueCategoryDistinctive/{Id}
export const fetchVenueCategoryDistinctiveById = async (id) => {
  const response = await axiosInstance.get(
    `venue-category-distinctive/GetVenueCategoryDistinctive/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-category-distinctive/GetByGuid/{venueCategoryGuid}
export const fetchVenueCategoryDistinctiveByGuid = async (venueCategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-category-distinctive/GetByGuid/${venueCategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-category-distinctive/delete/{Id}
export const deleteVenueCategoryDistinctive = async (id) => {
  const response = await axiosInstance.delete(`venue-category-distinctive/delete/${id}`, {
    headers,
  });
  return response.data;
};