import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

// POST /api/v1/experience-subcategory-card/add
// Body: { experienceSubcategoryGuid, title, subtitle, description, displayOrder }
export const addExperienceSubcategoryCard = async (data) => {
  const response = await axiosInstance.post('experience-subcategory-card/add', data, { headers });
  return response.data;
};

// PUT /api/v1/experience-subcategory-card/update
// Body: { id, title, subtitle, description, displayOrder }
export const updateExperienceSubcategoryCard = async (data) => {
  const response = await axiosInstance.put('experience-subcategory-card/update', data, { headers });
  return response.data;
};

// GET /api/v1/experience-subcategory-card/GetAllExperienceSubcategoryCards
export const fetchAllExperienceSubcategoryCards = async () => {
  const response = await axiosInstance.get(
    'experience-subcategory-card/GetAllExperienceSubcategoryCards',
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/experience-subcategory-card/GetExperienceSubcategoryCard/{Id}
export const fetchExperienceSubcategoryCardById = async (id) => {
  const response = await axiosInstance.get(
    `experience-subcategory-card/GetExperienceSubcategoryCard/${id}`,
    { headers }
  );
  return response.data.result;
};

// GET /api/v1/experience-subcategory-card/GetByExperienceSubcategoryGuid/{experienceSubcategoryGuid}
export const fetchExperienceSubcategoryCardsByGuid = async (experienceSubcategoryGuid) => {
  const response = await axiosInstance.get(
    `experience-subcategory-card/GetByExperienceSubcategoryGuid/${experienceSubcategoryGuid}`,
    { headers }
  );
  return response.data.result;
};

// DELETE /api/v1/experience-subcategory-card/delete/{Id}
export const deleteExperienceSubcategoryCard = async (id) => {
  const response = await axiosInstance.delete(
    `experience-subcategory-card/delete/${id}`,
    { headers }
  );
  return response.data;
};