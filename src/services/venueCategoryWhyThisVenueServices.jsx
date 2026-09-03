import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
  // Add/update take a plain JSON body per swagger example.
};

// POST /api/v1/venue-category-why-this-venue/add
// body (application/json): { venueCategoryGuid, title, description, displayOrder }
export const addVenueCategoryWhyThisVenue = async (data) => {
  const response = await axiosInstance.post('venue-category-why-this-venue/add', data, {
    headers,
  });
  return response.data;
};

// PUT /api/v1/venue-category-why-this-venue/update
// body (application/json): { id, title, description, displayOrder }
export const updateVenueCategoryWhyThisVenue = async (data) => {
  const response = await axiosInstance.put('venue-category-why-this-venue/update', data, {
    headers,
  });
  return response.data;
};

// GET /api/v1/venue-category-why-this-venue/GetAllVenueCategoryWhyThisVenue
export const fetchAllVenueCategoryWhyThisVenue = async () => {
  const response = await axiosInstance.get(
    'venue-category-why-this-venue/GetAllVenueCategoryWhyThisVenue',
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-category-why-this-venue/GetVenueCategoryWhyThisVenue/{Id}
export const fetchVenueCategoryWhyThisVenueById = async (id) => {
  const response = await axiosInstance.get(
    `venue-category-why-this-venue/GetVenueCategoryWhyThisVenue/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/venue-category-why-this-venue/GetByGuid/{venueCategoryGuid}
export const fetchVenueCategoryWhyThisVenueByGuid = async (venueCategoryGuid) => {
  const response = await axiosInstance.get(
    `venue-category-why-this-venue/GetByGuid/${venueCategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/venue-category-why-this-venue/delete/{Id}
export const deleteVenueCategoryWhyThisVenue = async (id) => {
  const response = await axiosInstance.delete(`venue-category-why-this-venue/delete/${id}`, {
    headers,
  });
  return response.data;
};